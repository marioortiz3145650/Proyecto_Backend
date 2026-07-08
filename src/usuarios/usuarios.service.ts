import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Rol } from '../roles/entities/rol.entity';
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
    const rol = await this.rolRepository.findOneBy({ uuid: createUsuarioDto.rol });
    if (!rol) {
      throw new NotFoundException(`Rol con ID/UUID ${createUsuarioDto.rol} no encontrado`);
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
        where.rol = { uuid: filterDto.rol };
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

    const validSortFields = ['id', 'uuid', 'nombre', 'correo', 'nombre_usuario', 'activo', 'fecha_registro'];
    const orderBy = validSortFields.includes(sortBy) ? sortBy : 'nombre';

    const [data, total] = await this.userRepository.findAndCount({
      where,
      select: ['uuid', 'id', 'nombre', 'correo', 'nombre_usuario', 'rol', 'activo', 'fecha_registro'],
      relations: ['rol'],
      skip,
      take: limit,
      order: { [orderBy]: order },
    });

    return PaginationUtil.createPaginatedResponse(data, total, page, limit);
  }

  async findOne(idOrUuid: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrUuid);
    const where = isUuid ? { uuid: idOrUuid } : { id: parseInt(idOrUuid, 10) };
    const user = await this.userRepository.findOne({
      where,
      select: ['uuid', 'id', 'nombre', 'correo', 'nombre_usuario', 'rol', 'activo', 'fecha_registro'],
      relations: ['rol']
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID/UUID ${idOrUuid} no encontrado`);
    }

    return user;
  }

  async update(idOrUuid: string, updateUsuarioDto: UpdateUsuarioDto) {
    const user = await this.findOne(idOrUuid);

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

    // Si viene contraseña, hashearla
    if (updateUsuarioDto.contraseña) {
      updateData.contrasena_hash = await bcrypt.hash(updateUsuarioDto.contraseña, 10);
    }

    // Si viene rol, verificar que existe
    if (updateUsuarioDto.rol) {
      const rol = await this.rolRepository.findOneBy({ uuid: updateUsuarioDto.rol });
      if (!rol) {
        throw new NotFoundException(`Rol con ID/UUID ${updateUsuarioDto.rol} no encontrado`);
      }
      updateData.rol = rol;  // Objeto completo
    }

    await this.userRepository.update({ uuid: user.uuid }, updateData);
    return this.findOne(user.uuid);
  }

  async findActive() {
    return this.userRepository.find({
      where: { activo: true },
      select: ['uuid', 'id', 'nombre', 'correo', 'nombre_usuario', 'rol', 'activo', 'fecha_registro'],
      relations: ['rol']
    });
  }

  async remove(idOrUuid: string) {
    const user = await this.findOne(idOrUuid);
    await this.userRepository.delete({ uuid: user.uuid });
    return { message: 'Usuario eliminado permanentemente' };
  }

    async validateUser(username: string, password: string): Promise<any> {
      const user = await this.userRepository.findOne({
        where: { nombre_usuario: username },
        select: ['uuid', 'id', 'nombre', 'correo', 'nombre_usuario', 'contrasena_hash', 'activo'],
        relations: ['rol'],  // ← agregar esto
      });

      if (!user) return null;

      const isPasswordValid = await bcrypt.compare(password, user.contrasena_hash);
      if (!isPasswordValid) return null;

      const { contrasena_hash, ...result } = user;
      return result;
    }

    async findGuestUser(): Promise<any> {
        return this.userRepository.findOne({
            where: {
                rol: { nombre: 'Visitante' },
                activo: true,
            },
            select: ['uuid', 'id', 'nombre', 'correo', 'nombre_usuario', 'rol', 'activo'],
            relations: ['rol'],
        });
    }
}
