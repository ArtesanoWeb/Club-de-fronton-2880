import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MatchModality } from '../../generated/prisma/enums';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';

const ELO_K_FACTOR = 32;
const DEFAULT_RATING = 1000;

const matchInclude = {
  season: true,
  mvpPlayer: true,
  teamA: { include: { player1: true, player2: true } },
  teamB: { include: { player1: true, player2: true } },
} satisfies Prisma.MatchInclude;

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.match.findMany({
      include: matchInclude,
      orderBy: { playedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: matchInclude,
    });
    if (!match) {
      throw new NotFoundException('Partido no encontrado');
    }
    return match;
  }

  async create(dto: CreateMatchDto) {
    if (dto.scoreA === dto.scoreB) {
      throw new BadRequestException('El marcador no puede terminar en empate');
    }

    const allPlayerIds = [...dto.teamA, ...dto.teamB];
    if (new Set(allPlayerIds).size !== 4) {
      throw new BadRequestException(
        'Los 4 jugadores del partido deben ser distintos',
      );
    }

    if (dto.mvpPlayerId && !allPlayerIds.includes(dto.mvpPlayerId)) {
      throw new BadRequestException(
        'El MVP debe ser uno de los jugadores del partido',
      );
    }

    const players = await this.prisma.player.findMany({
      where: { id: { in: allPlayerIds } },
    });
    if (players.length !== 4) {
      throw new NotFoundException('Alguno de los jugadores no existe');
    }

    if (dto.modality === MatchModality.TEMPORADA_OFICIAL && !dto.seasonId) {
      throw new BadRequestException(
        'Los partidos de temporada oficial requieren seasonId',
      );
    }

    if (dto.seasonId) {
      const season = await this.prisma.season.findUnique({
        where: { id: dto.seasonId },
      });
      if (!season) {
        throw new NotFoundException('Temporada no encontrada');
      }
    }

    const teamAWins = dto.scoreA > dto.scoreB;

    const matchId = await this.prisma.$transaction(async (tx) => {
      const teamA = await this.findOrCreateDuo(tx, dto.teamA[0], dto.teamA[1]);
      const teamB = await this.findOrCreateDuo(tx, dto.teamB[0], dto.teamB[1]);

      const match = await tx.match.create({
        data: {
          seasonId: dto.seasonId,
          modality: dto.modality,
          teamAId: teamA.id,
          teamBId: teamB.id,
          scoreA: dto.scoreA,
          scoreB: dto.scoreB,
          mvpPlayerId: dto.mvpPlayerId,
          durationMinutes: dto.durationMinutes,
          notes: dto.notes,
          playedAt: dto.playedAt ? new Date(dto.playedAt) : undefined,
        },
      });

      if (dto.modality !== MatchModality.AMISTOSO) {
        await this.updateIndividualRankings(
          tx,
          dto.teamA,
          dto.teamB,
          teamAWins,
        );
        await this.updateDuoRankings(tx, teamA.id, teamB.id, teamAWins);
      }

      return match.id;
    });

    return this.findOne(matchId);
  }

  private async findOrCreateDuo(
    tx: Prisma.TransactionClient,
    playerAId: string,
    playerBId: string,
  ) {
    const [player1Id, player2Id] = [playerAId, playerBId].sort();
    const existing = await tx.duo.findUnique({
      where: { player1Id_player2Id: { player1Id, player2Id } },
    });
    if (existing) {
      return existing;
    }
    return tx.duo.create({ data: { player1Id, player2Id } });
  }

  private async getOrCreateIndividualRanking(
    tx: Prisma.TransactionClient,
    playerId: string,
  ) {
    const existing = await tx.rankingIndividual.findUnique({
      where: { playerId },
    });
    if (existing) {
      return existing;
    }
    return tx.rankingIndividual.create({
      data: { playerId, points: DEFAULT_RATING },
    });
  }

  private async getOrCreateDuoRanking(
    tx: Prisma.TransactionClient,
    duoId: string,
  ) {
    const existing = await tx.rankingDuo.findUnique({ where: { duoId } });
    if (existing) {
      return existing;
    }
    return tx.rankingDuo.create({ data: { duoId, points: DEFAULT_RATING } });
  }

  private eloDelta(
    ratingSelf: number,
    ratingOpponent: number,
    didWin: boolean,
  ): number {
    const expected =
      1 / (1 + Math.pow(10, (ratingOpponent - ratingSelf) / 400));
    return Math.round(ELO_K_FACTOR * ((didWin ? 1 : 0) - expected));
  }

  private nextStreak(currentStreak: number, didWin: boolean): number {
    if (didWin) {
      return currentStreak >= 0 ? currentStreak + 1 : 1;
    }
    return currentStreak <= 0 ? currentStreak - 1 : -1;
  }

  private async updateIndividualRankings(
    tx: Prisma.TransactionClient,
    teamAIds: string[],
    teamBIds: string[],
    teamAWins: boolean,
  ) {
    const rankings = new Map<
      string,
      Awaited<ReturnType<typeof this.getOrCreateIndividualRanking>>
    >();
    for (const id of [...teamAIds, ...teamBIds]) {
      rankings.set(id, await this.getOrCreateIndividualRanking(tx, id));
    }

    const teamARating =
      (rankings.get(teamAIds[0])!.points + rankings.get(teamAIds[1])!.points) /
      2;
    const teamBRating =
      (rankings.get(teamBIds[0])!.points + rankings.get(teamBIds[1])!.points) /
      2;

    const teamADelta = this.eloDelta(teamARating, teamBRating, teamAWins);
    const teamBDelta = this.eloDelta(teamBRating, teamARating, !teamAWins);

    for (const id of teamAIds) {
      await this.applyIndividualRankingUpdate(
        tx,
        rankings.get(id)!,
        teamADelta,
        teamAWins,
      );
    }
    for (const id of teamBIds) {
      await this.applyIndividualRankingUpdate(
        tx,
        rankings.get(id)!,
        teamBDelta,
        !teamAWins,
      );
    }
  }

  private async applyIndividualRankingUpdate(
    tx: Prisma.TransactionClient,
    ranking: { playerId: string; points: number; currentStreak: number },
    delta: number,
    didWin: boolean,
  ) {
    await tx.rankingIndividual.update({
      where: { playerId: ranking.playerId },
      data: {
        points: ranking.points + delta,
        wins: { increment: didWin ? 1 : 0 },
        losses: { increment: didWin ? 0 : 1 },
        currentStreak: this.nextStreak(ranking.currentStreak, didWin),
      },
    });
  }

  private async updateDuoRankings(
    tx: Prisma.TransactionClient,
    teamADuoId: string,
    teamBDuoId: string,
    teamAWins: boolean,
  ) {
    const [rankingA, rankingB] = await Promise.all([
      this.getOrCreateDuoRanking(tx, teamADuoId),
      this.getOrCreateDuoRanking(tx, teamBDuoId),
    ]);

    const deltaA = this.eloDelta(rankingA.points, rankingB.points, teamAWins);
    const deltaB = this.eloDelta(rankingB.points, rankingA.points, !teamAWins);

    await tx.rankingDuo.update({
      where: { duoId: teamADuoId },
      data: {
        points: rankingA.points + deltaA,
        wins: { increment: teamAWins ? 1 : 0 },
        losses: { increment: teamAWins ? 0 : 1 },
        currentStreak: this.nextStreak(rankingA.currentStreak, teamAWins),
      },
    });

    await tx.rankingDuo.update({
      where: { duoId: teamBDuoId },
      data: {
        points: rankingB.points + deltaB,
        wins: { increment: !teamAWins ? 1 : 0 },
        losses: { increment: !teamAWins ? 0 : 1 },
        currentStreak: this.nextStreak(rankingB.currentStreak, !teamAWins),
      },
    });
  }
}
