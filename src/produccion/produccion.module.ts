import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importante
import { ProduccionService } from './produccion.service';
import { ProduccionController } from './produccion.controller';
import { Produccion } from './entities/produccion.entity'; // Importante
import { UsersModule } from '../usuarios/usuarios.module';
import { LotesModule } from '../lotes/lotes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produccion]),
    UsersModule,
    LotesModule
  ],
  controllers: [ProduccionController],
  providers: [ProduccionService],
  exports: [TypeOrmModule] // Por si otro módulo necesita usar Producción después
})
export class ProduccionModule {}