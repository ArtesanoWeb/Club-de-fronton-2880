import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.player.findMany({
      include: { ranking: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: { ranking: true },
    });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }
    return player;
  }

  async findByUserId(userId: string) {
    const player = await this.prisma.player.findUnique({
      where: { userId },
      include: { ranking: true },
    });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }
    return player;
  }

  async update(id: string, dto: UpdatePlayerDto) {
    await this.findOne(id);
    return this.prisma.player.update({ where: { id }, data: dto });
  }

  async updateByUserId(userId: string, dto: UpdatePlayerDto) {
    await this.findByUserId(userId);
    return this.prisma.player.update({ where: { userId }, data: dto });
  }
}
