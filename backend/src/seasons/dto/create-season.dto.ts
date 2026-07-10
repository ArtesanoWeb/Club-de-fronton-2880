import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { SeasonStatus } from '../../../generated/prisma/enums';

export class CreateSeasonDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(SeasonStatus)
  status?: SeasonStatus;
}
