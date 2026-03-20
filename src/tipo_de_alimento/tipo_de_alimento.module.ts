import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoDeAlimentosService } from './tipo_de_alimento.service';
import { TipoDeAlimentosController } from './tipo_de_alimento.controller';
import { TipoDeAlimento } from './entities/tipo_de_alimento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoDeAlimento])],
  controllers: [TipoDeAlimentosController],
  providers: [TipoDeAlimentosService],
})
export class TipoDeAlimentosModule {}