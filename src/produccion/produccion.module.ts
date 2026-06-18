import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importante
import { ProduccionService } from './produccion.service';
import { ProduccionController } from './produccion.controller';
import { Produccion } from './entities/produccion.entity'; // Importante
import { UsersModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    // Esta línea le dice a Nest: "Usa esta entidad para crear la tabla en Postgres"
    TypeOrmModule.forFeature([Produccion]),
    UsersModule
  ],
  controllers: [ProduccionController],
  providers: [ProduccionService],
  exports: [TypeOrmModule] // Por si otro módulo necesita usar Producción después
})
export class ProduccionModule {}