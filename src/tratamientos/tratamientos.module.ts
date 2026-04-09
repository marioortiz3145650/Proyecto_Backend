import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <-- AGREGA ESTA LÍNEA
import { TratamientosService } from './tratamientos.service';
import { TratamientosController } from './tratamientos.controller';
import { Tratamiento } from './entities/tratamiento.entity'; // <-- AGREGA ESTA TAMBIÉN

@Module({
  imports: [TypeOrmModule.forFeature([Tratamiento])],
  controllers: [TratamientosController],
  providers: [TratamientosService],
  exports: [TypeOrmModule], // Opcional: por si necesitas usar el repositorio fuera
})
export class TratamientosModule {}