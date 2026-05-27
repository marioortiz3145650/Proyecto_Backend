import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Rol } from 'src/roles/entities/rol.entity';
import { User } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { PaginationUtil } from '../common/utils/pagination.util';
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

  async findAll(
    paginationDto: PaginationDto,
    filterDto?: FilterUsuarioDto,
  ): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 10, sortBy = 'nombre', order = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filterDto) {
      if (filterDto.nombre) {
        where.nombre = Like(`%${filterDto.nombre}%`);
      }

      if (filterDto.correo) {
        where.correo = Like(`%${filterDto.correo}%`);
      }

      if (filterDto.nombre_usuario) {
        where.nombre_usuario = Like(`%${filterDto.nombre_usuario}%`);
      }

      if (filterDto.rol) {
        where.rol = { id: filterDto.rol };
      }

      if (filterDto.activo !== undefined) {
        where.activo = filterDto.activo;
      }

      if (filterDto.fecha_registro_inicio && filterDto.fecha_registro_fin) {
        where.fecha_registro = Between(filterDto.fecha_registro_inicio, filterDto.fecha_registro_fin);
      } else if (filterDto.fecha_registro_inicio) {
        where.fecha_registro = MoreThanOrEqual(filterDto.fecha_registro_inicio);
      } else if (filterDto.fecha_registro_fin) {
        where.fecha_registro = LessThanOrEqual(filterDto.fecha_registro_fin);
      }
    }

    const validSortFields = ['id', 'nombre', 'correo', 'nombre_usuario', 'activo', 'fecha_registro'];
    const orderBy = validSortFields.includes(sortBy) ? sortBy : 'nombre';

    const [data, total] = await this.userRepository.findAndCount({
      where,
      select: ['id', 'nombre', 'correo', 'nombre_usuario', 'rol', 'activo', 'fecha_registro'],
      relations: ['rol'],
      skip,
      take: limit,
      order: { [orderBy]: order },
    });

    return PaginationUtil.createPaginatedResponse(data, total, page, limit);
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
}
