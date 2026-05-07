import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inquilino } from './entities/inquilino.entity';
import { InquilinosService } from './inquilinos.service';
import { InquilinosController } from './inquilinos.controller';
import { InquilinosResolverService } from './inquilinos-resolver.service';
import { InquilinoGuard } from './inquilinos.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Inquilino])],
  providers: [InquilinosService, InquilinosResolverService, InquilinoGuard],
  controllers: [InquilinosController],
  exports: [InquilinosService, InquilinosResolverService, InquilinoGuard],
})
export class InquilinosModule {}