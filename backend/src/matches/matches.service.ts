import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MatchFormat, MatchModality } from '../../generated/prisma/enums';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto, CreateMatchSetDto } from './dto/create-match.dto';

const ELO_K_FACTOR = 32; // default: TEMPORADA_OFICIAL (y REY_DE_CANCHA cuando exista)
const RETO_ELO_K_FACTOR = 48; // Reto pesa más en el ELO — punto de partida, ajustable
const DEFAULT_RATING = 1000;

const BLITZ_TARGET = 15;
const CAMPEONATO_TARGET = 18;

function getKFactor(modality: MatchModality): number {
  return modality === MatchModality.RETO ? RETO_ELO_K_FACTOR : ELO_K_FACTOR;
}

const matchInclude = {
  season: true,
  mvpPlayer: true,
  teamA: { include: { player1: true, player2: true } },
  teamB: { include: { player1: true, player2: true } },
  sets: { orderBy: { setNumber: 'asc' } },
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
    const { setsWonA, setsWonB, teamAWins } = this.deriveMatchResult(
      dto.format,
      dto.sets,
    );

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

    const kFactor = getKFactor(dto.modality);

    const matchId = await this.prisma.$transaction(async (tx) => {
      const teamA = await this.findOrCreateDuo(tx, dto.teamA[0], dto.teamA[1]);
      const teamB = await this.findOrCreateDuo(tx, dto.teamB[0], dto.teamB[1]);

      const match = await tx.match.create({
        data: {
          seasonId: dto.seasonId,
          modality: dto.modality,
          format: dto.format,
          teamAId: teamA.id,
          teamBId: teamB.id,
          scoreA: setsWonA,
          scoreB: setsWonB,
          mvpPlayerId: dto.mvpPlayerId,
          durationMinutes: dto.durationMinutes,
          notes: dto.notes,
          playedAt: dto.playedAt ? new Date(dto.playedAt) : undefined,
          sets: {
            create: dto.sets.map((s, i) => ({
              setNumber: i + 1,
              scoreA: s.scoreA,
              scoreB: s.scoreB,
            })),
          },
        },
      });

      if (dto.modality !== MatchModality.AMISTOSO) {
        await this.updateIndividualRankings(
          tx,
          dto.teamA,
          dto.teamB,
          teamAWins,
          kFactor,
        );
        await this.updateDuoRankings(
          tx,
          teamA.id,
          teamB.id,
          teamAWins,
          kFactor,
        );
      }

      return match.id;
    });

    return this.findOne(matchId);
  }

  private deriveMatchResult(format: MatchFormat, sets: CreateMatchSetDto[]) {
    const target =
      format === MatchFormat.BLITZ ? BLITZ_TARGET : CAMPEONATO_TARGET;

    if (format === MatchFormat.BLITZ && sets.length !== 1) {
      throw new BadRequestException('Blitz siempre se juega a un solo set');
    }

    let setsWonA = 0;
    let setsWonB = 0;

    sets.forEach((set, index) => {
      if (set.scoreA === set.scoreB) {
        throw new BadRequestException(
          `El set ${index + 1} no puede terminar en empate`,
        );
      }
      const winningScore = Math.max(set.scoreA, set.scoreB);
      if (winningScore < target) {
        throw new BadRequestException(
          `El set ${index + 1} debe alcanzar al menos ${target} puntos (formato ${format})`,
        );
      }
      if (set.scoreA > set.scoreB) {
        setsWonA++;
      } else {
        setsWonB++;
      }
    });

    if (sets.length === 2 && setsWonA !== 2 && setsWonB !== 2) {
      throw new BadRequestException(
        'Con 2 sets el resultado debe ser 2-0; si quedó 1-1 hace falta un tercer set',
      );
    }
    if (sets.length === 3) {
      const winsAfterTwo = sets
        .slice(0, 2)
        .filter((s) => s.scoreA > s.scoreB).length;
      if (winsAfterTwo === 2 || winsAfterTwo === 0) {
        throw new BadRequestException(
          'El tercer set solo aplica si el marcador quedó 1-1 tras los dos primeros',
        );
      }
    }

    return { setsWonA, setsWonB, teamAWins: setsWonA > setsWonB };
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
    kFactor: number,
  ): number {
    const expected =
      1 / (1 + Math.pow(10, (ratingOpponent - ratingSelf) / 400));
    return Math.round(kFactor * ((didWin ? 1 : 0) - expected));
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
    kFactor: number,
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

    const teamADelta = this.eloDelta(
      teamARating,
      teamBRating,
      teamAWins,
      kFactor,
    );
    const teamBDelta = this.eloDelta(
      teamBRating,
      teamARating,
      !teamAWins,
      kFactor,
    );

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
    kFactor: number,
  ) {
    const [rankingA, rankingB] = await Promise.all([
      this.getOrCreateDuoRanking(tx, teamADuoId),
      this.getOrCreateDuoRanking(tx, teamBDuoId),
    ]);

    const deltaA = this.eloDelta(
      rankingA.points,
      rankingB.points,
      teamAWins,
      kFactor,
    );
    const deltaB = this.eloDelta(
      rankingB.points,
      rankingA.points,
      !teamAWins,
      kFactor,
    );

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
