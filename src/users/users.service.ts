import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from 'src/rols/entities/rol.entity';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Rol)  
    private rolRepository: Repository<Rol>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    //  Verificar que el rol existe
    const rol = await this.rolRepository.findOneBy({ id: createUserDto.rol });
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${createUserDto.rol} no encontrado`);
    }

    //  Hashear contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    //  Crear usuario
    const user = this.userRepository.create({
      ...createUserDto,
      password_hash: hashedPassword,
      rol: rol,  //  Objeto completo
    });

    return this.userRepository.save(user);
  }

  async findActive() {
    return this.userRepository.find({
      where: { activo: true },
      select: ['id', 'name', 'email', 'username', 'rol', 'activo', 'fecha_registro']
    });
  }

  async findAll() {
    return this.userRepository.find({
      select: ['id', 'name', 'email', 'username', 'rol', 'activo', 'fecha_registro']
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'username', 'rol', 'activo', 'fecha_registro']
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    //  Preparar datos de actualización
    const updateData: Partial<User> = {};

  
    if (updateUserDto.name !== undefined) {
      updateData.name = updateUserDto.name;
    }

    if (updateUserDto.email !== undefined) {
      updateData.email = updateUserDto.email;
    }

    if (updateUserDto.username !== undefined) {
      updateData.username = updateUserDto.username;
    }

    if (updateUserDto.activo !== undefined) {
      updateData.activo = updateUserDto.activo;
    }

    //  Si viene password, hashearla
    if (updateUserDto.password) {
      updateData.password_hash = await bcrypt.hash(updateUserDto.password, 10);
    }

    //  Si viene rol, verificar que existe
    if (updateUserDto.rol) {
      const rol = await this.rolRepository.findOneBy({ id: updateUserDto.rol });
      if (!rol) {
        throw new NotFoundException(`Rol con ID ${updateUserDto.rol} no encontrado`);
      }
      updateData.rol = rol;  //  Objeto completo
    }

    await this.userRepository.update({ id }, updateData);
    return this.findOne(id);
  }

  async activate(id: string) {
    await this.findOne(id);
    await this.userRepository.update({ id }, { activo: true });
    return { message: 'Usuario activado correctamente' };
  }

  async deactivate(id: string) {
    await this.findOne(id);
    await this.userRepository.update({ id }, { activo: false });
    return { message: 'Usuario desactivado correctamente' };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.userRepository.delete({ id });
    return { message: 'Usuario eliminado permanentemente' };
  }
}