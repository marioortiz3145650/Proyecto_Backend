import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';  
import { Rol } from './entities/rol.entity';       
import { RolsService } from './rols.service';
import { RolsController } from './rols.controller';

@Module({
  controllers: [RolsController],
  providers: [RolsService],
  imports: [
    TypeOrmModule.forFeature([Rol])  
  ],
  exports: [RolsService, TypeOrmModule],
})
export class RolsModule {}