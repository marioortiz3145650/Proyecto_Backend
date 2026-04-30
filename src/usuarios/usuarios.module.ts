import { Module } from '@nestjs/common';
import { UsersService } from './usuarios.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './usuarios.controller';
import { User } from './entities/usuario.entity';
import { Rol } from 'src/roles/entities/rol.entity';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User, Rol])
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
