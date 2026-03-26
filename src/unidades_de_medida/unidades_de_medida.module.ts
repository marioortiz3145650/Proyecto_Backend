import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesDeMedidaService } from './unidades_de_medida.service';
import { UnidadesDeMedidaController } from './unidades_de_medida.controller';
import { UnidadMedida } from './entities/unidades_de_medida.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UnidadMedida])],
  controllers: [UnidadesDeMedidaController],
  providers: [UnidadesDeMedidaService],
})
export class UnidadesDeMedidaModule {}