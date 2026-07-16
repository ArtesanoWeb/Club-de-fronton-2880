import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { MatchFormat, MatchModality } from '../../../generated/prisma/enums';

// REY_DE_CANCHA excluido a propósito: es una sesión multi-equipo rotativa,
// un modelo de datos distinto que no encaja en Match (siempre 2 equipos fijos).
// Se implementa como módulo aparte más adelante.
const REGISTRABLE_MODALITIES = {
  TEMPORADA_OFICIAL: MatchModality.TEMPORADA_OFICIAL,
  RETO: MatchModality.RETO,
  AMISTOSO: MatchModality.AMISTOSO,
} as const;
export type RegistrableMatchModality =
  (typeof REGISTRABLE_MODALITIES)[keyof typeof REGISTRABLE_MODALITIES];

export class CreateMatchSetDto {
  @IsInt()
  @Min(0)
  scoreA: number;

  @IsInt()
  @Min(0)
  scoreB: number;
}

export class CreateMatchDto {
  @IsOptional()
  @IsString()
  seasonId?: string;

  @IsEnum(REGISTRABLE_MODALITIES)
  modality: RegistrableMatchModality;

  @IsEnum(MatchFormat)
  format: MatchFormat;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  teamA: string[];

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  teamB: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => CreateMatchSetDto)
  sets: CreateMatchSetDto[];

  @IsOptional()
  @IsString()
  mvpPlayerId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  playedAt?: string;
}
