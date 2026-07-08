import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Breed } from './entities/raza.entity';
import { CreateBreedDto } from './dto/create-raza.dto';
import { UpdateBreedDto } from './dto/update-raza.dto';

import { isUuid } from '../common/utils/uuid.util';

@Injectable()
export class BreedService {
  constructor(
    @InjectRepository(Breed)
    private breedRepository: Repository<Breed>,
  ) {}

  async create(createBreedDto: CreateBreedDto) {
    // Verificar si ya existe
    const existing = await this.breedRepository.findOne({
      where: { nombre_raza: createBreedDto.nombre_raza }
    });

    if (existing) {
      throw new ConflictException(`La raza "${createBreedDto.nombre_raza}" ya existe`);
    }

    const breed = this.breedRepository.create({
      ...createBreedDto,
      activo: createBreedDto.activo ?? true,
    });

    return this.breedRepository.save(breed);
  }

  async findAll(all = false) {
    return this.breedRepository.find({
      where: all ? {} : { activo: true },
      select: ['id_raza', 'uuid', 'nombre_raza', 'activo', 'fecha_creacion'],
      order: { nombre_raza: 'ASC' }
    });
  }

  async findOne(idOrUuid: string) {
    const where = isUuid(idOrUuid) ? { uuid: idOrUuid } : { id_raza: parseInt(idOrUuid, 10) };
    const breed = await this.breedRepository.findOne({
      where,
      select: ['id_raza', 'uuid', 'nombre_raza', 'activo', 'fecha_creacion']
    });

    if (!breed) {
      throw new NotFoundException(`Raza con ID/UUID ${idOrUuid} no encontrada`);
    }

    return breed;
  }

  async update(idOrUuid: string, updateBreedDto: UpdateBreedDto) {
    const breed = await this.findOne(idOrUuid);

    // Verificar nombre duplicado si se cambia
    if (updateBreedDto.nombre_raza && updateBreedDto.nombre_raza !== breed.nombre_raza) {
      const existing = await this.breedRepository.findOne({
        where: { nombre_raza: updateBreedDto.nombre_raza }
      });

      if (existing) {
        throw new ConflictException(`La raza "${updateBreedDto.nombre_raza}" ya existe`);
      }
    }

    await this.breedRepository.update({ uuid: breed.uuid }, updateBreedDto);
    return this.findOne(breed.uuid);
  }

  async remove(idOrUuid: string) {
    const breed = await this.findOne(idOrUuid);
    
    try {
      await this.breedRepository.delete({ uuid: breed.uuid });
      return { message: `Raza "${breed.nombre_raza}" eliminada correctamente` };
    } catch (error) {
      throw new ConflictException(
        `No se puede eliminar la raza "${breed.nombre_raza}" porque está asociada a uno o más lotes. Desactívala en su lugar.`
      );
    }
  }

  async restore(idOrUuid: string) {
    const breed = await this.findOne(idOrUuid);
    await this.breedRepository.update({ uuid: breed.uuid }, { activo: true });
    return { message: `Raza "${breed.nombre_raza}" activada correctamente` };
  }
}