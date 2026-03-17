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
    @InjectRepository(Rol)  // ✅ Inyectar repositorio de Rol
    private rolRepository: Repository<Rol>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // ✅ Verificar que el rol existe
    const rol = await this.rolRepository.findOneBy({ id: createUserDto.rol });
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${createUserDto.rol} no encontrado`);
    }

    // ✅ Hashear contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // ✅ Crear usuario con relación correcta
    const user = this.userRepository.create({
      ...createUserDto,
      password_hash: hashedPassword,
      rol: rol,  // ✅ Pasar el objeto Rol, no solo el ID
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

    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      
      await this.userRepository.update(id, {
        ...UpdateUserDto,
        password_hash: hashedPassword,
      });
    } else {
      await this.userRepository.update(id, UpdateUserDto);
    }

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