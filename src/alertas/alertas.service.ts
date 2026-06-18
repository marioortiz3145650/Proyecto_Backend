import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerta } from './entities/alerta.entity';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterAlertaDto } from './dto/filter-alerta.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { PaginationUtil } from '../common/utils/pagination.util';

@Injectable()
export class AlertasService {
  constructor(
    @InjectRepository(Alerta)
    private alertasRepository: Repository<Alerta>,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
    filterDto?: FilterAlertaDto,
  ): Promise<PaginatedResponse<Alerta>> {
    const { page = 1, limit = 10, sortBy = 'id_alerta', order = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filterDto) {
      if (filterDto.tipo !== undefined && filterDto.tipo !== '') {
        where.tipo = filterDto.tipo;
      }
      if (filterDto.prioridad !== undefined && filterDto.prioridad !== '') {
        where.prioridad = filterDto.prioridad;
      }
      if (typeof filterDto.leida === 'boolean') {
        where.leida = filterDto.leida;
      }
    }

    const validSortFields = ['id_alerta', 'titulo', 'tipo', 'prioridad', 'leida', 'fecha_creacion'];
    const orderBy = validSortFields.includes(sortBy) ? sortBy : 'id_alerta';

    const [data, total] = await this.alertasRepository.findAndCount({
      where,
      relations: ['lote', 'galpon'],
      skip,
      take: limit,
      order: { [orderBy]: order },
    });

    return PaginationUtil.createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: number): Promise<Alerta> {
    const alerta = await this.alertasRepository.findOne({
      where: { id_alerta: id },
      relations: ['lote', 'galpon'],
    });
    if (!alerta) {
      throw new NotFoundException(`Alerta con ID ${id} no encontrada`);
    }
    return alerta;
  }

  async create(createAlertaDto: CreateAlertaDto): Promise<Alerta> {
    const alerta = this.alertasRepository.create(createAlertaDto);
    return this.alertasRepository.save(alerta);
  }

  async update(id: number, updateAlertaDto: UpdateAlertaDto): Promise<Alerta> {
    const alerta = await this.findOne(id);
    Object.assign(alerta, updateAlertaDto);
    return this.alertasRepository.save(alerta);
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.alertasRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Alerta con ID ${id} no encontrada`);
    }
    return { message: `Alerta con ID ${id} eliminada correctamente` };
  }
}
