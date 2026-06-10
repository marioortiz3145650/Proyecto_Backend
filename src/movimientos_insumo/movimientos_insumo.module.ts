import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientosInsumoService } from './movimientos_insumo.service';
import { MovimientosInsumoController } from './movimientos_insumo.controller';
import { MovimientosInsumo } from './entities/movimientos_insumo.entity';
import { Alimento } from '../alimentos/entities/alimento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MovimientosInsumo, Alimento])],
  controllers: [MovimientosInsumoController],
  providers: [MovimientosInsumoService],
})
export class MovimientosInsumoModule {}