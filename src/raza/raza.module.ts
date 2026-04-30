import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Breed } from './entities/raza.entity';
import { BreedService } from './raza.service';
import { BreedController } from './raza.controller';

@Module({
  controllers: [BreedController],
  providers: [BreedService],
  imports: [TypeOrmModule.forFeature([Breed])],
  exports: [BreedService, TypeOrmModule],
})
export class BreedModule {}