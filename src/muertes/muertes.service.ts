import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';

import { Muerte } from './entities/muerte.entity';
import { Lote } from '../lotes/entities/lote.entity';
import { CreateMuerteDto } from './dto/create-muerte.dto';
import { User } from '../usuarios/entities/usuario.entity';
import { UpdateMuerteDto } from './dto/update-muerte.dto';
import { FilterMuerteDto } from './dto/filter-muerte.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { PaginationUtil } from '../common/utils/pagination.util';

import { isUuid } from '../common/utils/uuid.util';

@Injectable()
export class MuertesService {
  constructor(
    @InjectRepository(Muerte)
    private muerteRepo: Repository<Muerte>,

    @InjectRepository(Lote)
    private loteRepo: Repository<Lote>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateMuerteDto) {
    const lote = await this.loteRepo.findOne({
      where: { uuid: dto.loteId }
    });
    if (!lote) throw new NotFoundException('Lote no encontrado');

    if (lote.fecha_fin) {
      throw new BadRequestException('No se pueden registrar bajas en un lote finalizado');
    }

    if ((lote.total_gallinas || 0) < dto.cantidad) {
      throw new BadRequestException(
        `El lote #${lote.id_lote} solo tiene ${lote.total_gallinas || 0} gallinas, no puedes registrar ${dto.cantidad} bajas.`
      );
    }

    const usuario = await this.userRepo.findOne({
      where: { uuid: dto.usuarioId }
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const muerte = this.muerteRepo.create({
      fecha: dto.fecha,
      cantidad: dto.cantidad,
      causa: dto.causa,
      lote,
      usuario,
    });

    const resultado = await this.muerteRepo.save(muerte);

    // Descontar del lote
    await this.loteRepo.update(
      { uuid: lote.uuid },
      { total_gallinas: Math.max(0, (lote.total_gallinas || 0) - dto.cantidad) }
    );

    return resultado;
  }

  async update(idOrUuid: string, dto: UpdateMuerteDto) {
    const muerteAnterior = await this.findOne(idOrUuid);
    const updateData: Partial<Muerte> = {};

    if (dto.fecha !== undefined) updateData.fecha = dto.fecha as any;
    if (dto.causa !== undefined) updateData.causa = dto.causa;

    const lote = muerteAnterior.lote;

    if (lote.fecha_fin) {
      throw new BadRequestException('No se pueden modificar registros de bajas en un lote finalizado');
    }

    if (dto.cantidad !== undefined) {
      const diferencia = dto.cantidad - muerteAnterior.cantidad;
      if (diferencia > (lote.total_gallinas || 0)) {
        throw new BadRequestException(
          `El lote solo tiene ${lote.total_gallinas || 0} gallinas disponibles. No puedes registrar ${diferencia} bajas adicionales.`
        );
      }
      updateData.cantidad = dto.cantidad;

      await this.loteRepo.update(
        { uuid: lote.uuid },
        { total_gallinas: Math.max(0, (lote.total_gallinas || 0) - diferencia) }
      );
    }

    if (dto.loteId !== undefined && dto.loteId !== lote.uuid) {
      const nuevoLote = await this.loteRepo.findOne({ where: { uuid: dto.loteId } });
      if (!nuevoLote) throw new NotFoundException('Lote no encontrado');
      if (nuevoLote.fecha_fin) {
        throw new BadRequestException('No se pueden transferir bajas a un lote finalizado');
      }

      const cantidadFinal = dto.cantidad !== undefined ? dto.cantidad : muerteAnterior.cantidad;

      // Devolver gallinas al lote anterior
      await this.loteRepo.update(
        { uuid: lote.uuid },
        { total_gallinas: (lote.total_gallinas || 0) + muerteAnterior.cantidad }
      );

      // Descontar del nuevo lote
      if ((nuevoLote.total_gallinas || 0) < cantidadFinal) {
        // Deshacer devolución
        await this.loteRepo.update(
          { uuid: lote.uuid },
          { total_gallinas: lote.total_gallinas }
        );
        throw new BadRequestException(
          `El nuevo lote solo tiene ${nuevoLote.total_gallinas || 0} gallinas, no se pueden registrar ${cantidadFinal} bajas.`
        );
      }

      await this.loteRepo.update(
        { uuid: nuevoLote.uuid },
        { total_gallinas: Math.max(0, (nuevoLote.total_gallinas || 0) - cantidadFinal) }
      );

      updateData.lote = nuevoLote;
    }

    if (dto.usuarioId !== undefined) {
      const usuario = await this.userRepo.findOne({ where: { uuid: dto.usuarioId } });
      if (!usuario) throw new NotFoundException('Usuario no encontrado');
      updateData.usuario = usuario;
    }

    await this.muerteRepo.update({ uuid: muerteAnterior.uuid }, updateData);
    return this.findOne(muerteAnterior.uuid);
  }

  async remove(idOrUuid: string) {
    const muerte = await this.findOne(idOrUuid);

    if (muerte.lote?.fecha_fin) {
      throw new BadRequestException('No se pueden eliminar registros de bajas de un lote finalizado');
    }

    // Devolver gallinas al lote
    await this.loteRepo.update(
      { uuid: muerte.lote.uuid },
      { total_gallinas: (muerte.lote.total_gallinas || 0) + muerte.cantidad }
    );

    await this.muerteRepo.delete({ uuid: muerte.uuid });
    return { message: 'Muerte eliminada correctamente' };
  }

  async findAll(
    paginationDto: PaginationDto,
    filterDto?: FilterMuerteDto,
  ): Promise<PaginatedResponse<Muerte>> {
    const { page = 1, limit = 10, sortBy = 'fecha', order = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filterDto) {
      if (filterDto.fecha) {
        where.fecha = filterDto.fecha;
      }

      if (filterDto.lote) {
        where.lote = { uuid: filterDto.lote };
      }

      if (filterDto.cantidad_min !== undefined && filterDto.cantidad_max !== undefined) {
        where.cantidad = Between(filterDto.cantidad_min, filterDto.cantidad_max);
      } else if (filterDto.cantidad_min !== undefined) {
        where.cantidad = Between(filterDto.cantidad_min, Infinity);
      } else if (filterDto.cantidad_max !== undefined) {
        where.cantidad = Between(0, filterDto.cantidad_max);
      }

      if (filterDto.causa) {
        where.causa = Like(`%${filterDto.causa}%`);
      }
    }

    const validSortFields = ['id_muerte', 'uuid', 'fecha', 'cantidad'];
    const orderBy = validSortFields.includes(sortBy) ? sortBy : 'fecha';

    const [data, total] = await this.muerteRepo.findAndCount({
      where,
      relations: ['lote', 'usuario'],
      skip,
      take: limit,
      order: { [orderBy]: order },
    });

    return PaginationUtil.createPaginatedResponse(data, total, page, limit);
  }

  async findOne(idOrUuid: string) {
    const where = isUuid(idOrUuid) ? { uuid: idOrUuid } : { id_muerte: parseInt(idOrUuid, 10) };
    const muerte = await this.muerteRepo.findOne({
      where,
      relations: ['lote', 'usuario'],
    });

    if (!muerte) {
      throw new NotFoundException(`Muerte con ID/UUID ${idOrUuid} no encontrada`);
    }

    return muerte;
  }


}
