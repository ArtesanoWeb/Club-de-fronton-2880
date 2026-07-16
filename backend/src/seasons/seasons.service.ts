import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';

@Injectable()
export class SeasonsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSeasonDto) {
    const existing = await this.prisma.season.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Ya existe una temporada con este nombre');
    }
    return this.prisma.season.create({
      data: {
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status,
      },
    });
  }

  findAll() {
    return this.prisma.season.findMany({ orderBy: { startDate: 'desc' } });
  }

  async findOne(id: string) {
    const season = await this.prisma.season.findUnique({ where: { id } });
    if (!season) {
      throw new NotFoundException('Temporada no encontrada');
    }
    return season;
  }

  async update(id: string, dto: UpdateSeasonDto) {
    await this.findOne(id);
    return this.prisma.season.update({
      where: { id },
      data: {
        name: dto.name,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.season.delete({ where: { id } });
  }

  async getStandings(id: string) {
    await this.findOne(id);

    const matches = await this.prisma.match.findMany({
      where: { seasonId: id },
      include: {
        teamA: { include: { player1: true, player2: true } },
        teamB: { include: { player1: true, player2: true } },
      },
    });

    const playerStats = new Map<
      string,
      {
        player: (typeof matches)[number]['teamA']['player1'];
        wins: number;
        losses: number;
      }
    >();
    const duoStats = new Map<
      string,
      { duo: (typeof matches)[number]['teamA']; wins: number; losses: number }
    >();

    const bumpPlayer = (
      player: (typeof matches)[number]['teamA']['player1'],
      won: boolean,
    ) => {
      const entry = playerStats.get(player.id) ?? {
        player,
        wins: 0,
        losses: 0,
      };
      if (won) entry.wins++;
      else entry.losses++;
      playerStats.set(player.id, entry);
    };

    const bumpDuo = (duo: (typeof matches)[number]['teamA'], won: boolean) => {
      const entry = duoStats.get(duo.id) ?? { duo, wins: 0, losses: 0 };
      if (won) entry.wins++;
      else entry.losses++;
      duoStats.set(duo.id, entry);
    };

    for (const match of matches) {
      const teamAWon = match.scoreA > match.scoreB;
      bumpPlayer(match.teamA.player1, teamAWon);
      bumpPlayer(match.teamA.player2, teamAWon);
      bumpPlayer(match.teamB.player1, !teamAWon);
      bumpPlayer(match.teamB.player2, !teamAWon);
      bumpDuo(match.teamA, teamAWon);
      bumpDuo(match.teamB, !teamAWon);
    }

    const byStanding = (
      a: { wins: number; losses: number },
      b: { wins: number; losses: number },
    ) => {
      const aPlayed = a.wins + a.losses;
      const bPlayed = b.wins + b.losses;
      const aRate = aPlayed > 0 ? a.wins / aPlayed : 0;
      const bRate = bPlayed > 0 ? b.wins / bPlayed : 0;
      return b.wins - a.wins || bRate - aRate || bPlayed - aPlayed;
    };

    const individual = Array.from(playerStats.entries())
      .map(([playerId, s]) => {
        const matchesPlayed = s.wins + s.losses;
        return {
          playerId,
          player: s.player,
          matchesPlayed,
          wins: s.wins,
          losses: s.losses,
          winRate: matchesPlayed > 0 ? s.wins / matchesPlayed : 0,
        };
      })
      .sort(byStanding);

    const duos = Array.from(duoStats.entries())
      .map(([duoId, s]) => {
        const matchesPlayed = s.wins + s.losses;
        return {
          duoId,
          duo: s.duo,
          matchesPlayed,
          wins: s.wins,
          losses: s.losses,
          winRate: matchesPlayed > 0 ? s.wins / matchesPlayed : 0,
        };
      })
      .sort(byStanding);

    return { individual, duos };
  }
}
