import { Controller, Get } from '@nestjs/common';
import { RankingsService } from './rankings.service';

@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get('individual')
  getIndividual() {
    return this.rankingsService.getIndividual();
  }

  @Get('duo')
  getDuo() {
    return this.rankingsService.getDuo();
  }
}
