import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Muerte } from './entities/muerte.entity';
import { Lote } from '../lotes/entities/lote.entity';

import { MuertesService } from './muertes.service';
import { MuertesController } from './muertes.controller';
import { User } from 'src/usuarios/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Muerte, Lote, User])],
  controllers: [MuertesController],
  providers: [MuertesService],
})
export class MuertesModule {}