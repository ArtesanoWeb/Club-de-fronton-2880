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
}
