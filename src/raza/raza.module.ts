import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raza } from './entities/raza.entity';
import { RazaService } from './raza.service';
import { RazaController } from './raza.controller';

@Module({
  controllers: [RazaController],
  providers: [RazaService],
  imports: [TypeOrmModule.forFeature([Raza])],
  exports: [RazaService, TypeOrmModule],
})
export class RazaModule {}