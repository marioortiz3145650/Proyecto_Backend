import { Injectable, BadRequestException } from '@nestjs/common';
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

@Injectable()
export class ProduccionService {
  constructor(
    @InjectRepository(Produccion)
    private readonly produccionRepository: Repository<Produccion>,
    private readonly usersService: UsersService,
  ) {}

  async create(createProduccionDto: CreateProduccionDto) {
    // 1. Extraemos los valores o les ponemos 0 si vienen vacíos
    const { 
      jumbo = 0, aaa = 0, aa = 0, a = 0, b = 0, c = 0, 
      lote_id, creado_por, fecha 
    } = createProduccionDto;

    // Validar que el creador sea Administrador o Aprendiz
    const user = await this.usersService.findOne(creado_por);
    const rolNombre = typeof user.rol === 'object' ? user.rol.nombre : user.rol;
    if (rolNombre !== 'Administrador' && rolNombre !== 'Aprendiz') {
      throw new BadRequestException('La producción solo puede ser registrada por un Administrador o Aprendiz');
    }

    // 2. Calculamos el TOTAL automáticamente
    const total = jumbo + aaa + aa + a + b + c;

    // 3. Creamos el objeto para la base de datos
    const nuevaProduccion = this.produccionRepository.create({
      fecha,
      jumbo,
      aaa,
      aa,
      a,
      b,
      c,
      total, // Aquí va la suma automática
      lote: { id_lote: lote_id }, // Relación con el ID del Lote (number)
      creado_por: { id: creado_por }, // Relación con el UUID del Usuario
    });

    // 4. Guardamos en Postgres
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
        where.lote = { id_lote: filterDto.lote };
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

    const validSortFields = ['id_produccion', 'fecha', 'total', 'jumbo', 'aaa', 'aa', 'a', 'b', 'c'];
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

  async findOne(id: number) {
    const produccion = await this.produccionRepository.findOne({
      where: { id_produccion: id },
      relations: ['lote', 'creado_por'],
    });

    if (!produccion) {
      throw new Error(`Producción con ID ${id} no encontrada`);
    }

    return produccion;
  }

  async update(id: number, updateProduccionDto: UpdateProduccionDto) {
    const produccion = await this.findOne(id);

    if (updateProduccionDto.creado_por !== undefined) {
      const user = await this.usersService.findOne(updateProduccionDto.creado_por);
      const rolNombre = typeof user.rol === 'object' ? user.rol.nombre : user.rol;
      if (rolNombre !== 'Administrador' && rolNombre !== 'Aprendiz') {
        throw new BadRequestException('La producción solo puede ser registrada por un Administrador o Aprendiz');
      }
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

    if (updateProduccionDto.lote_id !== undefined) {
      produccion.lote = { id_lote: updateProduccionDto.lote_id } as any;
    }

    if (updateProduccionDto.creado_por !== undefined) {
      produccion.creado_por = { id: updateProduccionDto.creado_por } as any;
    }

    await this.produccionRepository.save(produccion);
    return this.findOne(id);
  }

  async remove(id: number) {
    const produccion = await this.findOne(id);
    return await this.produccionRepository.remove(produccion);
  }
}
