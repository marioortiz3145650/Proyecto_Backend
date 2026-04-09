import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLoteCierreDto } from './dto/create-lote-cierre.dto';
import { UpdateLoteCierreDto } from './dto/update-lote-cierre.dto';
import { LoteCierre } from './entities/lote-cierre.entity';

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

  async findAll() {
    return await this.repo.find();
  }

  async findOne(id: number) {
    const registro = await this.repo.findOne({ where: { id_cierre: id } });
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