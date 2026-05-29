import { Module } from '@nestjs/common';
import { BreedService } from './breed.service';
import { BreedController } from './breed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Breed } from './entities/breed.entity'; // O como se llame tu entidad de raza

@Module({
  imports: [
    TypeOrmModule.forFeature([Breed])
  ],
  controllers: [BreedController],
  providers: [BreedService],
  exports: [TypeOrmModule] // <--- ¡AÑADE ESTA LÍNEA para hacer público el BreedRepository!
})
export class BreedModule {}