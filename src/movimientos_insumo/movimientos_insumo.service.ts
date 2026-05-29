import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovimientosInsumoDto } from './dto/create-movimientos_insumo.dto';
import { UpdateMovimientosInsumoDto } from './dto/update-movimientos_insumo.dto';
import { MovimientosInsumo } from './entities/movimientos_insumo.entity';
import { MovimientosInsumoQueryDto } from './dto/movimientos-insumo-query.dto';

@Injectable()
export class MovimientosInsumoService {
  constructor(
    @InjectRepository(MovimientosInsumo)
    private readonly repo: Repository<MovimientosInsumo>,
  ) {}

  async create(dto: CreateMovimientosInsumoDto) {
    const registro = this.repo.create({
      fecha: new Date(dto.fecha),
      cantidad: dto.cantidad,
      tipo_movimiento: dto.tipo_movimiento,
      observaciones: dto.observaciones || '',
      alimento: { id_alimento: dto.insumo_id } as any, 
      lote: { id_lote: dto.lote_id } as any,
      creado_por: { id: dto.creado_por } as any,
    });
    return await this.repo.save(registro);
  }

  async findAll(queryDto: MovimientosInsumoQueryDto) {
    const { page = 1, limit = 10, lote_id, insumo_id, tipo_movimiento } = queryDto;
    const queryBuilder = this.repo.createQueryBuilder('mov')
      .leftJoinAndSelect('mov.alimento', 'alimento')
      .leftJoinAndSelect('mov.lote', 'lote')
      .leftJoinAndSelect('mov.creado_por', 'usuario');

    if (lote_id) {
      queryBuilder.andWhere('mov.lote_id = :lote_id', { lote_id });
    }

    if (insumo_id) {
      queryBuilder.andWhere('mov.alimento_id = :insumo_id', { insumo_id });
    }

    if (tipo_movimiento) {
      queryBuilder.andWhere('mov.tipo_movimiento = :tipo_movimiento', { tipo_movimiento });
    }

    const [data, totalItems] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('mov.fecha', 'DESC')
      .getManyAndCount();

    return {
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  async findOne(id: number) {
    const movimiento = await this.repo.findOne({ 
      where: { id_movimiento: id },
      relations: ['alimento', 'lote', 'creado_por']
    });
    if (!movimiento) throw new NotFoundException(`Movimiento #${id} no encontrado`);
    return movimiento;
  }

  async update(id: number, updateDto: UpdateMovimientosInsumoDto) {
    const movimiento = await this.findOne(id);
    const actualizado = this.repo.merge(movimiento, updateDto as any);
    return await this.repo.save(actualizado);
  }

  async remove(id: number) {
    const movimiento = await this.findOne(id);
    return await this.repo.remove(movimiento);
  }
}