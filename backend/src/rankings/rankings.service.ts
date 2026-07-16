import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RankingsService {
  constructor(private readonly prisma: PrismaService) {}

  getIndividual() {
    return this.prisma.rankingIndividual.findMany({
      include: { player: true },
      orderBy: { points: 'desc' },
    });
  }

  getDuo() {
    return this.prisma.rankingDuo.findMany({
      include: { duo: { include: { player1: true, player2: true } } },
      orderBy: { points: 'desc' },
    });
  }
}
