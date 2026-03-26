import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovimientosInsumoDto } from './dto/create-movimientos_insumo.dto';
import { UpdateMovimientosInsumoDto } from './dto/update-movimientos_insumo.dto';
import { MovimientosInsumo } from './entities/movimientos_insumo.entity';

@Injectable()
export class MovimientosInsumoService {
  constructor(
    @InjectRepository(MovimientosInsumo)
    private readonly repo: Repository<MovimientosInsumo>,
  ) {}

  async create(dto: CreateMovimientosInsumoDto) {
    // Usamos insert() que es más directo para nuevos registros
    const resultado = await this.repo.insert({
      fecha: new Date(dto.fecha),
      cantidad: dto.cantidad,
      tipo_movimiento: dto.tipo_movimiento,
      observaciones: dto.observaciones || '',
      alimento: { id_alimento: dto.insumo_id } as any, 
      lote: { id_lote: dto.lote_id } as any,
      creado_por: { id: dto.creado_por } as any,
    });

    return resultado.identifiers[0]; // Retorna el ID generado
  }

  async findAll() {
    return await this.repo.find({
      relations: ['alimento', 'lote', 'creado_por'] // Para que en el GET se vea toda la info
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
    // Buscamos el registro existente
    const movimiento = await this.findOne(id);
    
    // Fusionamos los cambios del DTO al objeto encontrado
    const actualizado = this.repo.merge(movimiento, updateDto as any);
    
    return await this.repo.save(actualizado);
  }

  async remove(id: number) {
    const movimiento = await this.findOne(id);
    return await this.repo.remove(movimiento);
  }
}