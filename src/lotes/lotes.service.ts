import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, Not, IsNull } from 'typeorm';
import { Lote } from './entities/lote.entity';
import { Breed } from '../raza/entities/raza.entity';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { FilterLoteDto } from './dto/filter-lote.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { PaginationUtil } from '../common/utils/pagination.util';

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

  async findAll(
    paginationDto: PaginationDto,
    filterDto?: FilterLoteDto,
  ): Promise<PaginatedResponse<Lote>> {
    const { page = 1, limit = 10, sortBy = 'id_lote', order = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filterDto) {
      if (filterDto.raza) {
        where.raza = { id_raza: filterDto.raza };
      }

      if (filterDto.edad_semanas_min !== undefined && filterDto.edad_semanas_max !== undefined) {
        where.edad_semanas = Between(filterDto.edad_semanas_min, filterDto.edad_semanas_max);
      } else if (filterDto.edad_semanas_min !== undefined) {
        where.edad_semanas = MoreThanOrEqual(filterDto.edad_semanas_min);
      } else if (filterDto.edad_semanas_max !== undefined) {
        where.edad_semanas = LessThanOrEqual(filterDto.edad_semanas_max);
      }

      if (filterDto.produccion_pct_min !== undefined && filterDto.produccion_pct_max !== undefined) {
        where.produccion_pct = Between(filterDto.produccion_pct_min, filterDto.produccion_pct_max);
      } else if (filterDto.produccion_pct_min !== undefined) {
        where.produccion_pct = MoreThanOrEqual(filterDto.produccion_pct_min);
      } else if (filterDto.produccion_pct_max !== undefined) {
        where.produccion_pct = LessThanOrEqual(filterDto.produccion_pct_max);
      }

      if (filterDto.fecha_inicio) {
        where.fecha_inicio = filterDto.fecha_inicio;
      }

      if (filterDto.fecha_fin) {
        where.fecha_fin = filterDto.fecha_fin;
      }

      // Filtro para lotes activos (sin fecha_fin) o finalizados (con fecha_fin)
      if (filterDto.activo !== undefined) {
        if (filterDto.activo) {
          where.fecha_fin = IsNull(); // Lotes activos
        } else {
          where.fecha_fin = Not(IsNull()); // Lotes finalizados
        }
      }
    }

    const validSortFields = ['id_lote', 'edad_semanas', 'produccion_pct', 'fecha_inicio', 'fecha_fin', 'fecha_creacion'];
    const orderBy = validSortFields.includes(sortBy) ? sortBy : 'id_lote';

    const [data, total] = await this.loteRepository.findAndCount({
      where,
      relations: ['raza', 'galpones'],
      skip,
      take: limit,
      order: { [orderBy]: order },
    });

    return PaginationUtil.createPaginatedResponse(data, total, page, limit);
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
