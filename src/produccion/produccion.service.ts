import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produccion } from './entities/produccion.entity';
import { Lote } from '../lotes/entities/lote.entity';
import { CreateProduccionDto } from './dto/create-produccion.dto';
import { UpdateProduccionDto } from './dto/update-produccion.dto';
import { ProduccionQueryDto } from './dto/produccion-query.dto';

@Injectable()
export class ProduccionService {
  constructor(
    @InjectRepository(Produccion)
    private produccionRepo: Repository<Produccion>,
    @InjectRepository(Lote)
    private loteRepo: Repository<Lote>,
  ) {}

  async create(createProduccionDto: CreateProduccionDto) {
    const lote = await this.loteRepo.findOne({ where: { id_lote: createProduccionDto.lote_id } });
    if (!lote) throw new NotFoundException(`Lote ${createProduccionDto.lote_id} no encontrado`);

    const registro = this.produccionRepo.create({
      ...createProduccionDto,
      lote,
    } as any);
    return this.produccionRepo.save(registro);
  }

  async findAll(queryDto: ProduccionQueryDto) {
    const { page = 1, limit = 10, lote_id, search } = queryDto;
    const queryBuilder = this.produccionRepo.createQueryBuilder('prod')
      .leftJoinAndSelect('prod.lote', 'lote');

    if (lote_id) {
      queryBuilder.andWhere('prod.lote_id = :lote_id', { lote_id });
    }

    if (search) {
      queryBuilder.andWhere('lote.nombre LIKE :search', { search: `%${search}%` });
    }

    const [data, totalItems] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('prod.fecha', 'DESC')
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
    const registro = await this.produccionRepo.findOne({
      where: { id_produccion: id },
      relations: ['lote'],
    });
    if (!registro) throw new NotFoundException(`Registro de producción ${id} no encontrado`);
    return registro;
  }

  async update(id: number, updateProduccionDto: UpdateProduccionDto) {
    const registro = await this.findOne(id);
    if (updateProduccionDto.lote_id) {
      const lote = await this.loteRepo.findOne({ where: { id_lote: updateProduccionDto.lote_id } });
      if (!lote) throw new NotFoundException(`Lote ${updateProduccionDto.lote_id} no encontrado`);
      registro.lote = lote;
    }

    Object.assign(registro, updateProduccionDto);
    return this.produccionRepo.save(registro);
  }

  async remove(id: number) {
    const registro = await this.findOne(id);
    await this.produccionRepo.delete({ id_produccion: id });
    return { message: `Registro de producción ${id} eliminado` };
  }
}