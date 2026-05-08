import { Module } from '@nestjs/common'; // <-- ESTA LÍNEA ES CLAVE
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoteCierreService } from './lote-cierre.service';
import { LoteCierreController } from './lote-cierre.controller';
import { LoteCierre } from './entities/lote-cierre.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoteCierre])],
  controllers: [LoteCierreController],
  providers: [LoteCierreService],
})
export class LoteCierreModule {} // <-- NO OLVIDES CERRAR LA CLASE