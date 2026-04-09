import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lote } from './entities/lote.entity';
import { Breed } from '../raza/entities/breed.entity';
import { LotesService } from './lotes.service';
import { LotesController } from './lotes.controller';

@Module({
  controllers: [LotesController],
  providers: [LotesService],
  imports: [TypeOrmModule.forFeature([Lote, Breed])],
  exports: [LotesService, TypeOrmModule],
})
export class LotesModule {}