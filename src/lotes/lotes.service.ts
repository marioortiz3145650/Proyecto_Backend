import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, Not, IsNull } from 'typeorm';
import { Lote } from './entities/lote.entity';
import { Raza } from '../raza/entities/raza.entity';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { FilterLoteDto } from './dto/filter-lote.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { PaginationUtil } from '../common/utils/pagination.util';
import { isUuid } from '../common/utils/uuid.util';

@Injectable()
export class LotesService {
  constructor(
    @InjectRepository(Lote)
    private loteRepository: Repository<Lote>,
    @InjectRepository(Raza)
    private razaRepository: Repository<Raza>,
  ) {}


async create(createLoteDto: CreateLoteDto) {
  let raza: Raza | null = null;
  const razaId = createLoteDto.raza || createLoteDto.raza_id;

  if (razaId) {
    const razaWhere = isUuid(String(razaId)) ? { uuid: String(razaId) } : { id_raza: parseInt(String(razaId), 10) };
    raza = await this.razaRepository.findOne({
      where: razaWhere
    });

    if (!raza) {
      throw new NotFoundException(`Raza con ID ${razaId} no encontrada`);
    }
  }


  const loteData: Partial<Lote> = {
    edad_semanas: createLoteDto.edad_semanas,
    fecha_inicio: new Date(createLoteDto.fecha_inicio),
    fecha_fin: createLoteDto.fecha_fin ? new Date(createLoteDto.fecha_fin) : null,
    total_gallinas: createLoteDto.total_gallinas || 0,
  };


  if (raza) {
    loteData.raza = raza;
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
      const razaId = filterDto.raza || filterDto.raza_id;
      if (razaId) {
        where.raza = isUuid(String(razaId)) ? { uuid: String(razaId) } : { id_raza: parseInt(String(razaId), 10) };
      }

      if (filterDto.edad_semanas !== undefined) {
        where.edad_semanas = filterDto.edad_semanas;
      } else if (filterDto.edad_semanas_min !== undefined && filterDto.edad_semanas_max !== undefined) {
        where.edad_semanas = Between(filterDto.edad_semanas_min, filterDto.edad_semanas_max);
      } else if (filterDto.edad_semanas_min !== undefined) {
        where.edad_semanas = MoreThanOrEqual(filterDto.edad_semanas_min);
      } else if (filterDto.edad_semanas_max !== undefined) {
        where.edad_semanas = LessThanOrEqual(filterDto.edad_semanas_max);
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

    const validSortFields = ['id_lote', 'uuid', 'edad_semanas', 'fecha_inicio', 'fecha_fin', 'fecha_creacion'];
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

  async findOne(idOrUuid: string) {
    const where = isUuid(idOrUuid) ? { uuid: idOrUuid } : { id_lote: parseInt(idOrUuid, 10) };
    const lote = await this.loteRepository.findOne({
      where,
      relations: ['raza', 'galpones'],
    });

    if (!lote) {
      throw new NotFoundException(`Lote con ID/UUID ${idOrUuid} no encontrado`);
    }

    return lote;
  }

  async update(idOrUuid: string, updateLoteDto: UpdateLoteDto) {
  const lote = await this.findOne(idOrUuid);


  const updateData: Partial<Lote> = {};


  if (updateLoteDto.edad_semanas !== undefined) {
    updateData.edad_semanas = updateLoteDto.edad_semanas;
  }



  if (updateLoteDto.fecha_inicio !== undefined) {
    updateData.fecha_inicio = new Date(updateLoteDto.fecha_inicio);
  }

  if (updateLoteDto.fecha_fin !== undefined) {
    updateData.fecha_fin = updateLoteDto.fecha_fin ? new Date(updateLoteDto.fecha_fin) : null;
  }

  if (updateLoteDto.total_gallinas !== undefined) {
    updateData.total_gallinas = updateLoteDto.total_gallinas;
  }

  const razaId = updateLoteDto.raza || updateLoteDto.raza_id;
  if (razaId) {
    const razaWhere = isUuid(String(razaId)) ? { uuid: String(razaId) } : { id_raza: parseInt(String(razaId), 10) };
    const raza = await this.razaRepository.findOne({
      where: razaWhere
    });

    if (!raza) {
      throw new NotFoundException(`Raza con ID ${razaId} no encontrada`);
    }

    updateData.raza = raza;  
  }

  this.loteRepository.merge(lote, updateData);
  await this.loteRepository.save(lote);
  return this.findOne(lote.uuid);
}

  async remove(idOrUuid: string) {
    const lote = await this.findOne(idOrUuid);
    

    if (lote.galpones && lote.galpones.length > 0) {
      throw new BadRequestException(`No se puede eliminar el lote ${idOrUuid} porque tiene ${lote.galpones.length} galpón(es) asociados`);
    }

    try {
      await this.loteRepository.delete({ uuid: lote.uuid });
      return { message: `Lote ${idOrUuid} eliminado correctamente` };
    } catch (error: any) {
      if (error.code === '23503' || String(error.message).includes('foreign key constraint')) {
        throw new BadRequestException('No se puede eliminar el lote porque tiene registros de mortalidad o producción asociados. Elimine primero los registros vinculados.');
      }
      throw error;
    }
  }
  async toggleActivo(idOrUuid: string) {
    const lote = await this.findOne(idOrUuid);
    const nuevoEstado = lote.fecha_fin !== null;
    await this.loteRepository.update(
      { uuid: lote.uuid },
      { fecha_fin: nuevoEstado ? null : new Date() }
    );
    return this.findOne(lote.uuid);
  }
}
