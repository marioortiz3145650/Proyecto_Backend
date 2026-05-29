import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alimento } from './entities/alimento.entity';
import { CreateAlimentoDto } from './dto/create-alimento.dto';
import { UpdateAlimentoDto } from './dto/update-alimento.dto';
import { AlimentosQueryDto } from './dto/alimentos-query.dto';

@Injectable()
export class AlimentosService {
  constructor(
    @InjectRepository(Alimento)
    private alimentoRepository: Repository<Alimento>,
  ) {}

  async create(createAlimentoDto: CreateAlimentoDto) {
    const alimento = this.alimentoRepository.create(createAlimentoDto);
    return await this.alimentoRepository.save(alimento);
  }

  async findAll(queryDto: AlimentosQueryDto) {
    const { page = 1, limit = 10, search, tipo_alimento_id } = queryDto;
    const queryBuilder = this.alimentoRepository.createQueryBuilder('alimento');

    if (search) {
      queryBuilder.where('alimento.nombre_insumo LIKE :search', { search: `%${search}%` });
    }

    if (tipo_alimento_id) {
      const condition = search ? 'andWhere' : 'where';
      queryBuilder[condition]('alimento.tipo_alimento_id = :tipo_alimento_id', { tipo_alimento_id });
    }

    const [data, totalItems] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('alimento.nombre_insumo', 'ASC')
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
    const alimento = await this.alimentoRepository.findOneBy({ id_insumo: id });
    if (!alimento) throw new NotFoundException(`Alimento con ID ${id} no encontrado`);
    return alimento;
  }

  async update(id: number, updateAlimentoDto: UpdateAlimentoDto) {
    await this.findOne(id);
    await this.alimentoRepository.update(id, updateAlimentoDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.alimentoRepository.delete(id);
    return { message: `Alimento #${id} eliminado correctamente` };
  }
}