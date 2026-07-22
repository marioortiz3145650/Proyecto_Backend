import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

export interface ReporteQuery {
  fecha_inicio?: string;
  fecha_fin?: string;
  lote_id?: string;
}

@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('resumen')
  async resumen(@Query() query: ReporteQuery) {
    return this.reportesService.getResumen(query);
  }
}
