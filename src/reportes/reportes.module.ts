import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { Produccion } from '../produccion/entities/produccion.entity';
import { Lote } from '../lotes/entities/lote.entity';
import { Muerte } from '../muertes/entities/muerte.entity';
import { MovimientosInsumo } from '../movimientos_insumo/entities/movimientos_insumo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Produccion,
      Lote,
      Muerte,
      MovimientosInsumo,
    ]),
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
