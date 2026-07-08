import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { CreateProduccionDto } from './dto/create-produccion.dto';
import { UpdateProduccionDto } from './dto/update-produccion.dto';
import { Produccion } from './entities/produccion.entity';
import { FilterProduccionDto } from './dto/filter-produccion.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { PaginationUtil } from '../common/utils/pagination.util';
import { UsersService } from '../usuarios/usuarios.service';
import { LotesService } from '../lotes/lotes.service';
import { isUuid } from '../common/utils/uuid.util';

@Injectable()
export class ProduccionService {
  constructor(
    @InjectRepository(Produccion)
    private readonly produccionRepository: Repository<Produccion>,
    private readonly usersService: UsersService,
    private readonly lotesService: LotesService,
  ) {}

  async create(createProduccionDto: CreateProduccionDto) {
    const { 
      jumbo = 0, aaa = 0, aa = 0, a = 0, b = 0, c = 0, 
      lote_id, creado_por, fecha 
    } = createProduccionDto;

    if (!isUuid(creado_por)) {
      throw new BadRequestException('El usuario creador no es válido');
    }

    const user = await this.usersService.findOne(creado_por);
    const rolNombre = typeof user.rol === 'object' ? user.rol.nombre : user.rol;
    if (rolNombre !== 'Administrador' && rolNombre !== 'Aprendiz') {
      throw new BadRequestException('La producción solo puede ser registrada por un Administrador o Aprendiz');
    }

    const lote = await this.lotesService.findOne(lote_id);
    if (lote.fecha_fin) {
      throw new BadRequestException('No se puede registrar producción en un lote finalizado');
    }

    const total = jumbo + aaa + aa + a + b + c;

    const nuevaProduccion = this.produccionRepository.create({
      fecha,
      jumbo,
      aaa,
      aa,
      a,
      b,
      c,
      total,
      lote: { uuid: lote_id },
      creado_por: { uuid: creado_por },
    });

    return await this.produccionRepository.save(nuevaProduccion);
  }

  async findAll(
    paginationDto: PaginationDto,
    filterDto?: FilterProduccionDto,
  ): Promise<PaginatedResponse<Produccion>> {
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

      if (filterDto.jumbo_min !== undefined) {
        where.jumbo = MoreThanOrEqual(filterDto.jumbo_min);
      }

      if (filterDto.aaa_min !== undefined) {
        where.aaa = MoreThanOrEqual(filterDto.aaa_min);
      }

      if (filterDto.aa_min !== undefined) {
        where.aa = MoreThanOrEqual(filterDto.aa_min);
      }

      if (filterDto.a_min !== undefined) {
        where.a = MoreThanOrEqual(filterDto.a_min);
      }

      if (filterDto.b_min !== undefined) {
        where.b = MoreThanOrEqual(filterDto.b_min);
      }

      if (filterDto.c_min !== undefined) {
        where.c = MoreThanOrEqual(filterDto.c_min);
      }

      if (filterDto.total_min !== undefined) {
        where.total = MoreThanOrEqual(filterDto.total_min);
      }
    }

    const validSortFields = ['id_produccion', 'uuid', 'fecha', 'total', 'jumbo', 'aaa', 'aa', 'a', 'b', 'c'];
    const orderBy = validSortFields.includes(sortBy) ? sortBy : 'fecha';

    const [data, total] = await this.produccionRepository.findAndCount({
      where,
      relations: ['lote', 'creado_por'],
      skip,
      take: limit,
      order: { [orderBy]: order },
    });

    return PaginationUtil.createPaginatedResponse(data, total, page, limit);
  }

  async findOne(idOrUuid: string) {
    const where = isUuid(idOrUuid) ? { uuid: idOrUuid } : { id_produccion: parseInt(idOrUuid, 10) };
    const produccion = await this.produccionRepository.findOne({
      where,
      relations: ['lote', 'creado_por'],
    });

    if (!produccion) {
      throw new NotFoundException(`Producción con ID/UUID ${idOrUuid} no encontrada`);
    }

    return produccion;
  }

  async update(idOrUuid: string, updateProduccionDto: UpdateProduccionDto) {
    const produccion = await this.findOne(idOrUuid);

    // Si el lote actual está cerrado, no permitir edición de producción
    if (produccion.lote?.fecha_fin) {
      throw new BadRequestException('No se puede modificar la producción de un lote finalizado');
    }

    if (updateProduccionDto.creado_por !== undefined) {
      const creadoPor = typeof updateProduccionDto.creado_por === 'string'
        ? updateProduccionDto.creado_por
        : (updateProduccionDto.creado_por as any)?.uuid;

      if (!isUuid(creadoPor)) {
        throw new BadRequestException('El usuario creador no es válido');
      }

      const user = await this.usersService.findOne(creadoPor);
      const rolNombre = typeof user.rol === 'object' ? user.rol.nombre : user.rol;
      if (rolNombre !== 'Administrador' && rolNombre !== 'Aprendiz') {
        throw new BadRequestException('La producción solo puede ser registrada por un Administrador o Aprendiz');
      }
      produccion.creado_por = { uuid: creadoPor } as any;
    }
    
    const jumbo = updateProduccionDto.jumbo !== undefined ? updateProduccionDto.jumbo : produccion.jumbo;
    const aaa = updateProduccionDto.aaa !== undefined ? updateProduccionDto.aaa : produccion.aaa;
    const aa = updateProduccionDto.aa !== undefined ? updateProduccionDto.aa : produccion.aa;
    const a = updateProduccionDto.a !== undefined ? updateProduccionDto.a : produccion.a;
    const b = updateProduccionDto.b !== undefined ? updateProduccionDto.b : produccion.b;
    const c = updateProduccionDto.c !== undefined ? updateProduccionDto.c : produccion.c;

    const total = jumbo + aaa + aa + a + b + c;

    if (updateProduccionDto.fecha !== undefined) {
      produccion.fecha = new Date(updateProduccionDto.fecha);
    }
    produccion.jumbo = jumbo;
    produccion.aaa = aaa;
    produccion.aa = aa;
    produccion.a = a;
    produccion.b = b;
    produccion.c = c;
    produccion.total = total;

    if (updateProduccionDto.lote_id !== undefined && updateProduccionDto.lote_id !== produccion.lote?.uuid) {
      const nuevoLote = await this.lotesService.findOne(updateProduccionDto.lote_id);
      if (nuevoLote.fecha_fin) {
        throw new BadRequestException('No se puede transferir producción a un lote finalizado');
      }
      produccion.lote = nuevoLote;
    }

    await this.produccionRepository.save(produccion);
    return this.findOne(produccion.uuid);
  }

  async remove(idOrUuid: string) {
    const produccion = await this.findOne(idOrUuid);
    if (produccion.lote?.fecha_fin) {
      throw new BadRequestException('No se puede eliminar la producción de un lote finalizado');
    }
    return await this.produccionRepository.remove(produccion);
  }
}
