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
      where: { uuid: dto.insumo_id }
    });
    if (!alimento) {
      throw new NotFoundException(`Alimento con UUID ${dto.insumo_id} no encontrado`);
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
    
    const nuevo = this.repo.create({
      fecha: new Date(dto.fecha),
      cantidad: dto.cantidad,
      tipo_movimiento: dto.tipo_movimiento,
      observaciones: dto.observaciones || '',
      alimento: { uuid: dto.insumo_id } as any, 
      lote: { uuid: dto.lote_id } as any,
      creado_por: { uuid: dto.creado_por } as any,
    });

    return await this.repo.save(nuevo);
  }

  async findAll() {
    return await this.repo
      .createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.alimento', 'alimento')
      .leftJoinAndSelect('alimento.unidad_medida', 'unidad_medida')
      .leftJoinAndSelect('movimiento.lote', 'lote')
      .leftJoinAndSelect('movimiento.creado_por', 'creado_por')
      .orderBy('movimiento.id_movimiento', 'DESC')
      .getMany();
  }

  async findOne(uuid: string) {
    const movimiento = await this.repo
      .createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.alimento', 'alimento')
      .leftJoinAndSelect('alimento.unidad_medida', 'unidad_medida')
      .leftJoinAndSelect('movimiento.lote', 'lote')
      .leftJoinAndSelect('movimiento.creado_por', 'creado_por')
      .where('movimiento.uuid = :uuid', { uuid })
      .getOne();

    if (!movimiento) throw new NotFoundException(`Movimiento con UUID ${uuid} no encontrado`);
    return movimiento;
  }

  async update(uuid: string, updateDto: UpdateMovimientosInsumoDto) {
    const movimiento = await this.findOne(uuid);
    const updateData: any = { ...updateDto };

    const cantidadAnterior = Number(movimiento.cantidad);
    const tipoAnterior = movimiento.tipo_movimiento;

    const cantidadNueva = updateDto.cantidad !== undefined ? Number(updateDto.cantidad) : cantidadAnterior;
    const tipoNuevo = updateDto.tipo_movimiento !== undefined ? updateDto.tipo_movimiento : tipoAnterior;

    const insumoIdAnterior = movimiento.alimento?.uuid;
    const insumoIdNuevo = updateDto.insumo_id !== undefined ? updateDto.insumo_id : insumoIdAnterior;

    if (insumoIdNuevo !== insumoIdAnterior) {
      // Caso 1: Cambio de Insumo (Alimento)
      const alimentoAnterior = await this.alimentoRepo.findOne({ where: { uuid: insumoIdAnterior } });
      const alimentoNuevo = await this.alimentoRepo.findOne({ where: { uuid: insumoIdNuevo } });

      if (!alimentoNuevo) {
        throw new NotFoundException(`Alimento con UUID ${insumoIdNuevo} no encontrado`);
      }

      // 1. Revertir en el anterior
      if (alimentoAnterior) {
        const stockActualAnt = Number(alimentoAnterior.stock_actual);
        if (tipoAnterior === 'CONSUMO' || tipoAnterior === 'SALIDA') {
          alimentoAnterior.stock_actual = stockActualAnt + cantidadAnterior;
        } else if (tipoAnterior === 'ENTRADA') {
          alimentoAnterior.stock_actual = Math.max(0, stockActualAnt - cantidadAnterior);
        }
        await this.alimentoRepo.save(alimentoAnterior);
      }

      // 2. Aplicar en el nuevo
      const stockActualNvo = Number(alimentoNuevo.stock_actual);
      if (tipoNuevo === 'CONSUMO' || tipoNuevo === 'SALIDA') {
        if (stockActualNvo < cantidadNueva) {
          throw new ConflictException(
            `Stock insuficiente para el nuevo alimento "${alimentoNuevo.nombre}". Stock actual: ${stockActualNvo}, solicitado: ${cantidadNueva}`
          );
        }
        alimentoNuevo.stock_actual = stockActualNvo - cantidadNueva;
      } else if (tipoNuevo === 'ENTRADA') {
        alimentoNuevo.stock_actual = stockActualNvo + cantidadNueva;
      }
      await this.alimentoRepo.save(alimentoNuevo);

    } else {
      // Caso 2: Mismo Insumo (Alimento), cambio de cantidad y/o tipo
      const alimento = await this.alimentoRepo.findOne({ where: { uuid: insumoIdAnterior } });
      if (alimento) {
        let stockTemporal = Number(alimento.stock_actual);

        // 1. Revertir anterior temporalmente
        if (tipoAnterior === 'CONSUMO' || tipoAnterior === 'SALIDA') {
          stockTemporal += cantidadAnterior;
        } else if (tipoAnterior === 'ENTRADA') {
          stockTemporal = Math.max(0, stockTemporal - cantidadAnterior);
        }

        // 2. Aplicar nuevo
        if (tipoNuevo === 'CONSUMO' || tipoNuevo === 'SALIDA') {
          if (stockTemporal < cantidadNueva) {
            throw new ConflictException(
              `Stock insuficiente para el alimento "${alimento.nombre}". Stock actual recalculado: ${stockTemporal}, solicitado: ${cantidadNueva}`
            );
          }
          alimento.stock_actual = stockTemporal - cantidadNueva;
        } else if (tipoNuevo === 'ENTRADA') {
          alimento.stock_actual = stockTemporal + cantidadNueva;
        }

        await this.alimentoRepo.save(alimento);
      }
    }

    if (updateDto.fecha) {
      updateData.fecha = new Date(updateDto.fecha);
    }
    if (updateDto.insumo_id) {
      updateData.alimento = { uuid: updateDto.insumo_id };
      delete updateData.insumo_id;
    }
    if (updateDto.lote_id) {
      updateData.lote = { uuid: updateDto.lote_id };
      delete updateData.lote_id;
    }
    if (updateDto.creado_por) {
      updateData.creado_por = { uuid: updateDto.creado_por };
      delete updateData.creado_por;
    }

    const actualizado = this.repo.merge(movimiento, updateData);
    return await this.repo.save(actualizado);
  }

  async remove(uuid: string) {
    const movimiento = await this.findOne(uuid);

    if (movimiento.alimento) {
      const alimento = await this.alimentoRepo.findOne({
        where: { uuid: movimiento.alimento.uuid }
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