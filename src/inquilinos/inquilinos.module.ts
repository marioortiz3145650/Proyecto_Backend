import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inquilino } from './entities/inquilino.entity';
import { InquilinosService } from './inquilinos.service';
import { InquilinosController } from './inquilinos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Inquilino])],
  providers: [InquilinosService],
  controllers: [InquilinosController],
  exports: [InquilinosService],
})
export class InquilinosModule {}
