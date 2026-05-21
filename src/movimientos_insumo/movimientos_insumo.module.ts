import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientosInsumoService } from './movimientos_insumo.service';
import { MovimientosInsumoController } from './movimientos_insumo.controller';
import { MovimientosInsumo } from './entities/movimientos_insumo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MovimientosInsumo])],
  controllers: [MovimientosInsumoController],
  providers: [MovimientosInsumoService],
})
export class MovimientosInsumoModule {}