import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';

import { Muerte } from './entities/muerte.entity';
import { Lote } from '../lotes/entities/lote.entity';
import { CreateMuerteDto } from './dto/create-muerte.dto';
import { User } from 'src/usuarios/entities/usuario.entity';
import { UpdateMuerteDto } from './dto/update-muerte.dto';
import { FilterMuerteDto } from './dto/filter-muerte.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { PaginationUtil } from '../common/utils/pagination.util';

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
      where: { id_lote: dto.loteId }
    });

    if (!lote) {
      throw new NotFoundException('Lote no encontrado');
    }

    const usuario = await this.userRepo.findOne({
      where: { id: dto.usuarioId }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const muerte = this.muerteRepo.create({
      fecha: dto.fecha,
      cantidad: dto.cantidad,
      causa: dto.causa,
      lote: lote,
      usuario: usuario,
    });

    return this.muerteRepo.save(muerte);
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
        where.lote = { id_lote: filterDto.lote };
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

    const validSortFields = ['id_muerte', 'fecha', 'cantidad'];
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

  async findOne(id: number) {
    const muerte = await this.muerteRepo.findOne({
      where: { id_muerte: id },
      relations: ['lote', 'usuario'],
    });

    if (!muerte) {
      throw new NotFoundException(`Muerte con ID ${id} no encontrada`);
    }

    return muerte;
  }

  async update(id: number, dto: UpdateMuerteDto) {
    await this.findOne(id); // Verifica que existe
    
    const updateData: Partial<Muerte> = {};
    
    if (dto.fecha !== undefined) {
      updateData.fecha = dto.fecha;
    }
    
    if (dto.cantidad !== undefined) {
      updateData.cantidad = dto.cantidad;
    }
    
    if (dto.causa !== undefined) {
      updateData.causa = dto.causa;
    }
    
    // Manejar relaciones si se proporcionan
    if (dto.loteId !== undefined) {
      const lote = await this.loteRepo.findOne({ where: { id_lote: dto.loteId } });
      if (!lote) {
        throw new NotFoundException('Lote no encontrado');
      }
      updateData.lote = lote;
    }
    
    if (dto.usuarioId !== undefined) {
      const usuario = await this.userRepo.findOne({ where: { id: dto.usuarioId } });
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }
      updateData.usuario = usuario;
    }

    await this.muerteRepo.update({ id_muerte: id }, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.muerteRepo.delete({ id_muerte: id });
    return { message: 'Muerte eliminada correctamente' };
  }
}