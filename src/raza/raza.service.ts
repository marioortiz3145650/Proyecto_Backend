import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Breed } from './entities/raza.entity';
import { CreateBreedDto } from './dto/create-raza.dto';
import { UpdateBreedDto } from './dto/update-raza.dto';

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

  async findAll() {
    return this.breedRepository.find({
      where: { activo: true },
      select: ['id_raza', 'nombre_raza', 'activo', 'fecha_creacion'],
      order: { nombre_raza: 'ASC' }
    });
  }

  async findOne(id: number) {
    const breed = await this.breedRepository.findOne({
      where: { id_raza: id },
      select: ['id_raza', 'nombre_raza', 'activo', 'fecha_creacion']
    });

    if (!breed) {
      throw new NotFoundException(`Raza con ID ${id} no encontrada`);
    }

    return breed;
  }

  async update(id: number, updateBreedDto: UpdateBreedDto) {
    const breed = await this.findOne(id);

    // Verificar nombre duplicado si se cambia
    if (updateBreedDto.nombre_raza && updateBreedDto.nombre_raza !== breed.nombre_raza) {
      const existing = await this.breedRepository.findOne({
        where: { nombre_raza: updateBreedDto.nombre_raza }
      });

      if (existing) {
        throw new ConflictException(`La raza "${updateBreedDto.nombre_raza}" ya existe`);
      }
    }

    await this.breedRepository.update({ id_raza: id }, updateBreedDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const breed = await this.findOne(id);
    
    await this.breedRepository.update({ id_raza: id }, { activo: false });
    return { message: `Raza "${breed.nombre_raza}" desactivada correctamente` };
  }

  async restore(id: number) {
    const breed = await this.findOne(id);
    await this.breedRepository.update({ id_raza: id }, { activo: true });
    return { message: `Raza "${breed.nombre_raza}" activada correctamente` };
  }
}