import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Breed } from './entities/breed.entity';
import { BreedService } from './breed.service';
import { BreedController } from './breed.controller';

@Module({
  controllers: [BreedController],
  providers: [BreedService],
  imports: [TypeOrmModule.forFeature([Breed])],
  exports: [BreedService, TypeOrmModule],
})
export class BreedModule {}