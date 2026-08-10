import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolsService {
  constructor(
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async create(createRolDto: CreateRolDto) {
    const existingRol = await this.rolRepository.findOne({
      where: { nombre: createRolDto.nombre }
    });

    if (existingRol) {
      throw new ConflictException(`El rol "${createRolDto.nombre}" ya existe`);
    }

    const rol = this.rolRepository.create(createRolDto);
    return this.rolRepository.save(rol);
  }

  async findAll() {
    return this.rolRepository.find({
      select: ['uuid', 'id', 'nombre', 'fecha_creacion'],
      order: { nombre: 'ASC' }
    });
  }

  async findOne(idOrUuid: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrUuid);
    let where: any;
    if (isUuid) {
      where = { uuid: idOrUuid };
    } else {
      const parsedId = parseInt(idOrUuid, 10);
      if (isNaN(parsedId)) {
        throw new NotFoundException(`Rol con ID/UUID ${idOrUuid} no encontrado`);
      }
      where = { id: parsedId };
    }

    const rol = await this.rolRepository.findOne({
      where,
      select: ['uuid', 'id', 'nombre', 'fecha_creacion']
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID/UUID ${idOrUuid} no encontrado`);
    }

    return rol;
  }

  async update(idOrUuid: string, updateRolDto: UpdateRolDto) {
    const rol = await this.findOne(idOrUuid);
    
    if (updateRolDto.nombre) {
      const existingRol = await this.rolRepository.findOne({
        where: { nombre: updateRolDto.nombre }
      });
      
      if (existingRol && existingRol.uuid !== rol.uuid) {
        throw new ConflictException(`El rol "${updateRolDto.nombre}" ya existe`);
      }
    }

    await this.rolRepository.update({ uuid: rol.uuid }, updateRolDto);
    return this.findOne(rol.uuid);
  }

  async remove(idOrUuid: string) {
    const rol = await this.findOne(idOrUuid);    
    await this.rolRepository.delete({ uuid: rol.uuid });
    return { message: 'Rol eliminado correctamente' };
  }
}