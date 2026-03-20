import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlimentosService } from './alimentos.service';
import { AlimentosController } from './alimentos.controller';
import { Alimento } from './entities/alimento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alimento])],
  controllers: [AlimentosController],
  providers: [AlimentosService],
})
export class AlimentosModule {}