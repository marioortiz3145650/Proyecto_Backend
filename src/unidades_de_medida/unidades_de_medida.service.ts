import { Injectable } from '@nestjs/common';
import { CreateUnidadesDeMedidaDto } from './dto/create-unidades_de_medida.dto';
import { UpdateUnidadesDeMedidaDto } from './dto/update-unidades_de_medida.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnidadMedida } from './entities/unidades_de_medida.entity';
import { UnidadesDeMedidaQueryDto } from './dto/unidades-de-medida-query.dto';

@Injectable()
export class UnidadesDeMedidaService {

  constructor(
    @InjectRepository(UnidadMedida)
    private unidadRepository: Repository<UnidadMedida>,
  ) {}

  async create(dto: CreateUnidadesDeMedidaDto) {
    const unidad = this.unidadRepository.create(dto);
    return await this.unidadRepository.save(unidad);
  }

  async findAll(queryDto?: UnidadesDeMedidaQueryDto) {
    const { page = 1, limit = 10, search } = queryDto || {};
    const queryBuilder = this.unidadRepository.createQueryBuilder('unidad');

    if (search) {
      queryBuilder.where(
        'unidad.nombre LIKE :search OR unidad.abreviatura LIKE :search',
        { search: `%${search}%` }
      );
    }

    const [data, totalItems] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('unidad.nombre', 'ASC')
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
    return await this.unidadRepository.findOneBy({ id_unidad: id });
  }

  async update(id: number, dto: UpdateUnidadesDeMedidaDto) {
    await this.unidadRepository.update({ id_unidad: id }, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return await this.unidadRepository.delete({ id_unidad: id });
  }
}