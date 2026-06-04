import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../usuarios/entities/usuario.entity';
import { Rol } from '../roles/entities/rol.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Rol])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
