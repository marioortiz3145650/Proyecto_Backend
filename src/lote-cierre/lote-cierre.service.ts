import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLoteCierreDto } from './dto/create-lote-cierre.dto';
import { UpdateLoteCierreDto } from './dto/update-lote-cierre.dto';
import { LoteCierre } from './entities/lote-cierre.entity';
import { LoteCierreQueryDto } from './dto/lote-cierre-query.dto';

@Injectable()
export class LoteCierreService {
  constructor(
    @InjectRepository(LoteCierre)
    private readonly repo: Repository<LoteCierre>,
  ) {}

  async create(dto: CreateLoteCierreDto) {
    const cierre = this.repo.create(dto);
    return await this.repo.save(cierre);
  }

  async findAll(queryDto: LoteCierreQueryDto) {
    const { page = 1, limit = 10, lote_id, galpon_id } = queryDto;
    
    const queryBuilder = this.repo.createQueryBuilder('cierre')
      .leftJoinAndSelect('cierre.lote', 'lote');

    if (lote_id) {
      queryBuilder.andWhere('cierre.lote_id = :lote_id', { lote_id });
    }

    if (galpon_id) {
      queryBuilder.andWhere('cierre.galpon_id = :galpon_id', { galpon_id });
    }

    const [data, totalItems] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('cierre.fecha_cierre', 'DESC')
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
    const registro = await this.repo.findOne({ 
      where: { id_cierre: id },
      relations: ['lote']
    });
    if (!registro) throw new NotFoundException(`Cierre #${id} no encontrado`);
    return registro;
  }

  async update(id: number, updateDto: UpdateLoteCierreDto) {
    const registro = await this.findOne(id);
    this.repo.merge(registro, updateDto as any);
    return await this.repo.save(registro);
  }

  async remove(id: number) {
    const registro = await this.findOne(id);
    return await this.repo.remove(registro);
  }
}