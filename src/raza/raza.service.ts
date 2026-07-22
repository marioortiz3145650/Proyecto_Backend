import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Raza } from './entities/raza.entity';
import { CreateRazaDto } from './dto/create-raza.dto';
import { UpdateRazaDto } from './dto/update-raza.dto';

import { isUuid } from '../common/utils/uuid.util';

@Injectable()
export class RazaService {
  constructor(
    @InjectRepository(Raza)
    private razaRepository: Repository<Raza>,
  ) {}

  async create(createRazaDto: CreateRazaDto) {
    // Verificar si ya existe
    const existing = await this.razaRepository.findOne({
      where: { nombre_raza: createRazaDto.nombre_raza }
    });

    if (existing) {
      throw new ConflictException(`La raza "${createRazaDto.nombre_raza}" ya existe`);
    }

    const raza = this.razaRepository.create({
      ...createRazaDto,
      activo: createRazaDto.activo ?? true,
    });

    return this.razaRepository.save(raza);
  }

  async findAll(all = false) {
    return this.razaRepository.find({
      where: all ? {} : { activo: true },
      select: ['id_raza', 'uuid', 'nombre_raza', 'activo', 'fecha_creacion'],
      order: { nombre_raza: 'ASC' }
    });
  }

  async findOne(idOrUuid: string) {
    const where = isUuid(idOrUuid) ? { uuid: idOrUuid } : { id_raza: parseInt(idOrUuid, 10) };
    const raza = await this.razaRepository.findOne({
      where,
      select: ['id_raza', 'uuid', 'nombre_raza', 'activo', 'fecha_creacion']
    });

    if (!raza) {
      throw new NotFoundException(`Raza con ID/UUID ${idOrUuid} no encontrada`);
    }

    return raza;
  }

  async update(idOrUuid: string, updateRazaDto: UpdateRazaDto) {
    const raza = await this.findOne(idOrUuid);

    // Verificar nombre duplicado si se cambia
    if (updateRazaDto.nombre_raza && updateRazaDto.nombre_raza !== raza.nombre_raza) {
      const existing = await this.razaRepository.findOne({
        where: { nombre_raza: updateRazaDto.nombre_raza }
      });

      if (existing) {
        throw new ConflictException(`La raza "${updateRazaDto.nombre_raza}" ya existe`);
      }
    }

    await this.razaRepository.update({ uuid: raza.uuid }, updateRazaDto);
    return this.findOne(raza.uuid);
  }

  async remove(idOrUuid: string) {
    const raza = await this.findOne(idOrUuid);
    
    try {
      await this.razaRepository.delete({ uuid: raza.uuid });
      return { message: `Raza "${raza.nombre_raza}" eliminada correctamente` };
    } catch (error) {
      throw new ConflictException(
        `No se puede eliminar la raza "${raza.nombre_raza}" porque está asociada a uno o más lotes. Desactívala en su lugar.`
      );
    }
  }

  async restore(idOrUuid: string) {
    const raza = await this.findOne(idOrUuid);
    await this.razaRepository.update({ uuid: raza.uuid }, { activo: true });
    return { message: `Raza "${raza.nombre_raza}" activada correctamente` };
  }
}