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
import { isUuid } from '../common/utils/uuid.util';

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

    const validSortFields = ['id_alerta', 'uuid', 'titulo', 'tipo', 'prioridad', 'leida', 'fecha_creacion'];
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

  async findOne(idOrUuid: string): Promise<Alerta> {
    const where = isUuid(idOrUuid) ? { uuid: idOrUuid } : { id_alerta: parseInt(idOrUuid, 10) };
    const alerta = await this.alertasRepository.findOne({
      where,
      relations: ['lote', 'galpon'],
    });
    if (!alerta) {
      throw new NotFoundException(`Alerta con ID/UUID ${idOrUuid} no encontrada`);
    }
    return alerta;
  }

  async create(createAlertaDto: CreateAlertaDto): Promise<Alerta> {
    const alerta = this.alertasRepository.create(createAlertaDto);
    return this.alertasRepository.save(alerta);
  }

  async update(idOrUuid: string, updateAlertaDto: UpdateAlertaDto): Promise<Alerta> {
    const alerta = await this.findOne(idOrUuid);
    Object.assign(alerta, updateAlertaDto);
    return this.alertasRepository.save(alerta);
  }

  async remove(idOrUuid: string): Promise<{ message: string }> {
    const alerta = await this.findOne(idOrUuid);
    const result = await this.alertasRepository.delete({ uuid: alerta.uuid });
    if (result.affected === 0) {
      throw new NotFoundException(`Alerta con ID/UUID ${idOrUuid} no encontrada`);
    }
    return { message: `Alerta con ID/UUID ${idOrUuid} eliminada correctamente` };
  }
}
