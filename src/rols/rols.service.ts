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
      select: ['id', 'nombre', 'fecha_creacion'],
      order: { nombre: 'ASC' }
    });
  }

  async findOne(id: string) {
    const rol = await this.rolRepository.findOne({
      where: { id },
      select: ['id', 'nombre', 'fecha_creacion']
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return rol;
  }

  async update(id: string, updateRolDto: UpdateRolDto) {
    await this.findOne(id);
    
    if (updateRolDto.nombre) {
      const existingRol = await this.rolRepository.findOne({
        where: { nombre: updateRolDto.nombre, id: id }
      });
      
      if (existingRol) {
        throw new ConflictException(`El rol "${updateRolDto.nombre}" ya existe`);
      }
    }

    await this.rolRepository.update({ id }, updateRolDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);    
    await this.rolRepository.delete({ id });
    return { message: 'Rol eliminado correctamente' };
  }
}