import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from 'src/roles/entities/rol.entity';
import { User } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Rol)  
    private rolRepository: Repository<Rol>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    // Verificar que el rol existe
    const rol = await this.rolRepository.findOneBy({ id: createUsuarioDto.rol });
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${createUsuarioDto.rol} no encontrado`);
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(createUsuarioDto.contraseña, 10);
    
    // Crear usuario
    const user = this.userRepository.create({
      ...createUsuarioDto,
      contrasena_hash: hashedPassword,
      rol: rol,  // Objeto completo
    });

    return this.userRepository.save(user);
  }

  async findActive() {
    return this.userRepository.find({
      where: { activo: true },
      select: ['id', 'nombre', 'correo', 'nombre_usuario', 'rol', 'activo', 'fecha_registro']
    });
  }

  async findAll() {
    return this.userRepository.find({
      select: ['id', 'nombre', 'correo', 'nombre_usuario', 'rol', 'activo', 'fecha_registro']
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'nombre', 'correo', 'nombre_usuario', 'rol', 'activo', 'fecha_registro']
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    await this.findOne(id);

    // Preparar datos de actualización
    const updateData: Partial<User> = {};

    if (updateUsuarioDto.nombre !== undefined) {
      updateData.nombre = updateUsuarioDto.nombre;
    }

    if (updateUsuarioDto.correo !== undefined) {
      updateData.correo = updateUsuarioDto.correo;
    }

    if (updateUsuarioDto.nombre_usuario !== undefined) {
      updateData.nombre_usuario = updateUsuarioDto.nombre_usuario;
    }

    if (updateUsuarioDto.activo !== undefined) {
      updateData.activo = updateUsuarioDto.activo;
    }

    // Si viene contraseña, hashearla
    if (updateUsuarioDto.contraseña) {
      updateData.contrasena_hash = await bcrypt.hash(updateUsuarioDto.contraseña, 10);
    }

    // Si viene rol, verificar que existe
    if (updateUsuarioDto.rol) {
      const rol = await this.rolRepository.findOneBy({ id: updateUsuarioDto.rol });
      if (!rol) {
        throw new NotFoundException(`Rol con ID ${updateUsuarioDto.rol} no encontrado`);
      }
      updateData.rol = rol;  // Objeto completo
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

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userRepository.findOne({
            where: { nombre_usuario: username },
            select: ['id', 'nombre', 'correo', 'nombre_usuario', 'contrasena_hash', 'rol', 'activo']
        });
        
        if (!user) {
            return null;
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.contrasena_hash);
        if (!isPasswordValid) {
            return null;
        }
        
        // Remove password from returned user object
        const { contrasena_hash, ...result } = user;
        return result;
    }
}
