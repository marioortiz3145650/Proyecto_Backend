import { Injectable } from '@nestjs/common';
import { CreateAlimentoDto } from './dto/create-alimento.dto';
import { UpdateAlimentoDto } from './dto/update-alimento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Alimento } from './entities/alimento.entity';
import { FilterAlimentoDto } from './dto/filter-alimento.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { PaginationUtil } from '../common/utils/pagination.util';

@Injectable()
export class AlimentosService {

  constructor(
    @InjectRepository(Alimento)
    private alimentoRepository: Repository<Alimento>,
  ) {}

  async create(createAlimentoDto: CreateAlimentoDto) {
    const { tipo_alimento_id, unidad_medida_id, ...rest } = createAlimentoDto;
    const alimento = this.alimentoRepository.create({
      ...rest,
      tipo_alimento: { id_tipo_insumo: tipo_alimento_id } as any,
      unidad_medida: { id_unidad: unidad_medida_id } as any,
    });
    return await this.alimentoRepository.save(alimento);
  }

  async findAll(
    paginationDto: PaginationDto,
    filterDto?: FilterAlimentoDto,
  ): Promise<PaginatedResponse<Alimento>> {
    const { page = 1, limit = 10, sortBy = 'nombre', order = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filterDto) {
      if (filterDto.id_insumo) {
        where.id_insumo = filterDto.id_insumo;
      }

      if (filterDto.tipo_alimento) {
        where.tipo_alimento = { id_tipo_insumo: filterDto.tipo_alimento };
      }

      if (filterDto.unidad_medida) {
        where.unidad_medida = { id_unidad: filterDto.unidad_medida };
      }

      if (filterDto.stock_actual_min !== undefined && filterDto.stock_actual_max !== undefined) {
        where.stock_actual = Between(filterDto.stock_actual_min, filterDto.stock_actual_max);
      } else if (filterDto.stock_actual_min !== undefined) {
        where.stock_actual = Between(filterDto.stock_actual_min, Infinity);
      } else if (filterDto.stock_actual_max !== undefined) {
        where.stock_actual = Between(0, filterDto.stock_actual_max);
      }

      if (filterDto.stock_minimo !== undefined) {
        where.stock_minimo = filterDto.stock_minimo;
      }

      if (filterDto.precio_unitario_min !== undefined && filterDto.precio_unitario_max !== undefined) {
        where.precio_unitario = Between(filterDto.precio_unitario_min, filterDto.precio_unitario_max);
      } else if (filterDto.precio_unitario_min !== undefined) {
        where.precio_unitario = Between(filterDto.precio_unitario_min, Infinity);
      } else if (filterDto.precio_unitario_max !== undefined) {
        where.precio_unitario = Between(0, filterDto.precio_unitario_max);
      }
    }

    const validSortFields = ['id_insumo', 'nombre', 'stock_actual', 'stock_minimo', 'precio_unitario'];
    const orderBy = validSortFields.includes(sortBy) ? sortBy : 'nombre';

    const [data, total] = await this.alimentoRepository.findAndCount({
      where,
      relations: ['tipo_alimento', 'unidad_medida'],
      skip,
      take: limit,
      order: { [orderBy]: order },
    });

    return PaginationUtil.createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: number) {
    return await this.alimentoRepository.findOne({
      where: { id_insumo: id },
      relations: ['tipo_alimento', 'unidad_medida'],
    });
  }

  async update(id: number, updateAlimentoDto: UpdateAlimentoDto) {
    const { tipo_alimento_id, unidad_medida_id, ...rest } = updateAlimentoDto;
    const updateData: any = { ...rest };
    if (tipo_alimento_id !== undefined) {
      updateData.tipo_alimento = { id_tipo_insumo: tipo_alimento_id };
    }
    if (unidad_medida_id !== undefined) {
      updateData.unidad_medida = { id_unidad: unidad_medida_id };
    }
    await this.alimentoRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    return await this.alimentoRepository.delete(id);
  }
}