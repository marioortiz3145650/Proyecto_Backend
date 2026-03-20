import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Galpon } from './entities/galpone.entity';
import { Lote } from '../lotes/entities/lote.entity';
import { GalponesService } from './galpones.service';
import { GalponesController } from './galpones.controller';

@Module({
  controllers: [GalponesController],
  providers: [GalponesService],
  imports: [TypeOrmModule.forFeature([Galpon, Lote])],
  exports: [GalponesService, TypeOrmModule],
})
export class GalponesModule {}