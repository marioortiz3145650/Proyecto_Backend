import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { CreateTratamientoDto } from './dto/create-tratamiento.dto';
import { UpdateTratamientoDto } from './dto/update-tratamiento.dto';
import { FilterTratamientoDto } from './dto/filter-tratamiento.dto';
import { Tratamiento } from './entities/tratamiento.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { PaginationUtil } from '../common/utils/pagination.util';
import { isUuid } from '../common/utils/uuid.util';

@Injectable()
export class TratamientosService {
  constructor(
    @InjectRepository(Tratamiento)
    private readonly repo: Repository<Tratamiento>,
  ) {}

  async create(dto: CreateTratamientoDto) {
    const nuevo = this.repo.create({
      fecha: new Date(dto.fecha),
      tratamiento: dto.tratamiento,
      lote: { uuid: dto.lote_id } as any,
      creado_por: { uuid: dto.creado_por } as any,
    });
    const guardado = await this.repo.save(nuevo);
    return this.findOne(guardado.uuid);
  }

  async findAll(
    paginationDto?: PaginationDto,
    filterDto?: FilterTratamientoDto,
  ): Promise<PaginatedResponse<Tratamiento>> {
    const { page = 1, limit = 10, sortBy = 'fecha', order = 'DESC' } = paginationDto || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filterDto) {
      if (filterDto.fecha) {
        where.fecha = filterDto.fecha;
      }
      if (filterDto.lote) {
        if (isUuid(filterDto.lote)) {
          where.lote = { uuid: filterDto.lote };
        } else {
          const numLote = parseInt(filterDto.lote, 10);
          if (!isNaN(numLote)) {
            where.lote = { id_lote: numLote };
          }
        }
      }
      if (filterDto.tratamiento) {
        where.tratamiento = Like(`%${filterDto.tratamiento}%`);
      }
      if (filterDto.fecha_inicio && filterDto.fecha_fin) {
        where.fecha = Between(filterDto.fecha_inicio, filterDto.fecha_fin);
      }
    }

    const validSortFields = ['id_tratamiento', 'uuid', 'fecha', 'tratamiento'];
    const orderBy = validSortFields.includes(sortBy) ? sortBy : 'fecha';

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['lote', 'lote.raza', 'creado_por'],
      skip,
      take: limit,
      order: { [orderBy]: order },
    });

    return PaginationUtil.createPaginatedResponse(data, total, page, limit);
  }

  async findOne(idOrUuid: string) {
    const where = isUuid(idOrUuid) ? { uuid: idOrUuid } : { id_tratamiento: parseInt(idOrUuid, 10) };
    const registro = await this.repo.findOne({
      where,
      relations: ['lote', 'lote.raza', 'creado_por'],
    });
    if (!registro) throw new NotFoundException(`Tratamiento con ID/UUID ${idOrUuid} no existe`);
    return registro;
  }

  async update(uuid: string, updateDto: UpdateTratamientoDto) {
    const registro = await this.findOne(uuid);
    const updatedData: any = { ...updateDto };
    
    if (updateDto.fecha) {
      updatedData.fecha = new Date(updateDto.fecha);
    }
    if (updateDto.lote_id) {
      updatedData.lote = { uuid: updateDto.lote_id };
      delete updatedData.lote_id;
    }
    if (updateDto.creado_por) {
      updatedData.creado_por = { uuid: updateDto.creado_por };
      delete updatedData.creado_por;
    }
    
    this.repo.merge(registro, updatedData);
    await this.repo.save(registro);
    return this.findOne(registro.uuid);
  }

  async remove(uuid: string) {
    const registro = await this.findOne(uuid);
    await this.repo.remove(registro);
    return { message: 'Tratamiento eliminado correctamente' };
  }
}