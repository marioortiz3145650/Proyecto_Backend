import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lote } from './entities/lote.entity';
import { Breed } from '../raza/entities/breed.entity';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';

@Injectable()
export class LotesService {
  constructor(
    @InjectRepository(Lote)
    private loteRepository: Repository<Lote>,
    @InjectRepository(Breed)
    private breedRepository: Repository<Breed>,
  ) {}


async create(createLoteDto: CreateLoteDto) {
  let breed: Breed | null = null;

  if (createLoteDto.raza) {
    breed = await this.breedRepository.findOne({
      where: { id_raza: createLoteDto.raza }
    });

    if (!breed) {
      throw new NotFoundException(`Raza con ID ${createLoteDto.raza} no encontrada`);
    }
  }


  const loteData: Partial<Lote> = {
    edad_semanas: createLoteDto.edad_semanas,
    produccion_pct: createLoteDto.produccion_pct || 0,
    fecha_inicio: createLoteDto.fecha_inicio,
    fecha_fin: createLoteDto.fecha_fin || null,
  };


  if (breed) {
    loteData.raza = breed;
  }

  const lote = this.loteRepository.create(loteData);
  return this.loteRepository.save(lote);
}

  async findAll() {
    return this.loteRepository.find({
      relations: ['raza', 'galpones'],
      select: [
        'id_lote',
        'edad_semanas',
        'produccion_pct',
        'fecha_inicio',
        'fecha_fin',
        'fecha_creacion',
      ],
      order: { id_lote: 'DESC' }
    });
  }

  async findOne(id: number) {
    const lote = await this.loteRepository.findOne({
      where: { id_lote: id },
      relations: ['raza', 'galpones'],
    });

    if (!lote) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado`);
    }

    return lote;
  }

  async update(id: number, updateLoteDto: UpdateLoteDto) {
  const lote = await this.findOne(id);


  const updateData: Partial<Lote> = {};


  if (updateLoteDto.edad_semanas !== undefined) {
    updateData.edad_semanas = updateLoteDto.edad_semanas;
  }

  if (updateLoteDto.produccion_pct !== undefined) {
    updateData.produccion_pct = updateLoteDto.produccion_pct;
  }

  if (updateLoteDto.fecha_inicio !== undefined) {
    updateData.fecha_inicio = updateLoteDto.fecha_inicio;
  }

  if (updateLoteDto.fecha_fin !== undefined) {
    updateData.fecha_fin = updateLoteDto.fecha_fin;
  }

  if (updateLoteDto.raza) {
    const breed = await this.breedRepository.findOne({
      where: { id_raza: updateLoteDto.raza }
    });

    if (!breed) {
      throw new NotFoundException(`Raza con ID ${updateLoteDto.raza} no encontrada`);
    }

    updateData.raza = breed;  
  }

  await this.loteRepository.update({ id_lote: id }, updateData);
  return this.findOne(id);
}

  async remove(id: number) {
    const lote = await this.findOne(id);
    

    if (lote.galpones && lote.galpones.length > 0) {
      throw new Error(`No se puede eliminar el lote ${id} porque tiene ${lote.galpones.length} galpón(es) asociados`);
    }

    await this.loteRepository.delete({ id_lote: id });
    return { message: `Lote ${id} eliminado correctamente` };
  }
}