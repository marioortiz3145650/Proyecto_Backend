import { Module } from '@nestjs/common';
import { LotesService } from './lotes.service';
import { LotesController } from './lotes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lote } from './entities/lote.entity';
import { BreedModule } from '../breed/breed.module'; // <--- ¡Añade esta importación!

@Module({
  imports: [
    TypeOrmModule.forFeature([Lote]),
    BreedModule // <--- ¡AÑADE ESTO AQUÍ! Ahora LotesService puede usar el BreedRepository
  ],
  controllers: [LotesController],
  providers: [LotesService],
  exports: [TypeOrmModule] // Esta es la que habías puesto en el paso anterior, déjala ahí.
})
export class LotesModule {}