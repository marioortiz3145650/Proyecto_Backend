import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovimientosInsumoDto } from './dto/create-movimientos_insumo.dto';
import { UpdateMovimientosInsumoDto } from './dto/update-movimientos_insumo.dto';
import { MovimientosInsumo } from './entities/movimientos_insumo.entity';
import { Alimento } from '../alimentos/entities/alimento.entity';

@Injectable()
export class MovimientosInsumoService {
  constructor(
    @InjectRepository(MovimientosInsumo)
    private readonly repo: Repository<MovimientosInsumo>,
    @InjectRepository(Alimento)
    private readonly alimentoRepo: Repository<Alimento>,
  ) {}

  async create(dto: CreateMovimientosInsumoDto) {
    const alimento = await this.alimentoRepo.findOne({
      where: { id_insumo: dto.insumo_id }
    });
    if (!alimento) {
      throw new NotFoundException(`Alimento con ID ${dto.insumo_id} no encontrado`);
    }

    const cantidad = Number(dto.cantidad);
    const stockActual = Number(alimento.stock_actual);

    if (dto.tipo_movimiento === 'CONSUMO' || dto.tipo_movimiento === 'SALIDA') {
      if (stockActual < cantidad) {
        throw new ConflictException(
          `Stock insuficiente para el alimento "${alimento.nombre}". Stock actual: ${stockActual}, solicitado: ${cantidad}`
        );
      }
      alimento.stock_actual = stockActual - cantidad;
    } else if (dto.tipo_movimiento === 'ENTRADA') {
      alimento.stock_actual = stockActual + cantidad;
    }

    await this.alimentoRepo.save(alimento);
    
    const resultado = await this.repo.insert({
      fecha: new Date(dto.fecha),
      cantidad: dto.cantidad,
      tipo_movimiento: dto.tipo_movimiento,
      observaciones: dto.observaciones || '',
      alimento: { id_insumo: dto.insumo_id } as any, 
      lote: { id_lote: dto.lote_id } as any,
      creado_por: { id: dto.creado_por } as any,
    });

    return resultado.identifiers[0]; 
  }

  async findAll() {
    return await this.repo.find({
      relations: ['alimento', 'lote', 'creado_por'] 
    });
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

    if (movimiento.alimento) {
      const alimento = await this.alimentoRepo.findOne({
        where: { id_insumo: movimiento.alimento.id_insumo }
      });
      if (alimento) {
        const cantidad = Number(movimiento.cantidad);
        const stockActual = Number(alimento.stock_actual);

        if (movimiento.tipo_movimiento === 'CONSUMO' || movimiento.tipo_movimiento === 'SALIDA') {
          alimento.stock_actual = stockActual + cantidad;
        } else if (movimiento.tipo_movimiento === 'ENTRADA') {
          alimento.stock_actual = Math.max(0, stockActual - cantidad);
        }
        await this.alimentoRepo.save(alimento);
      }
    }

    return await this.repo.remove(movimiento);
  }
}