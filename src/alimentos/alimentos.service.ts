import { Injectable } from '@nestjs/common';
import { CreateAlimentoDto } from './dto/create-alimento.dto';
import { UpdateAlimentoDto } from './dto/update-alimento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alimento } from './entities/alimento.entity';

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

  async findAll() {
    return await this.alimentoRepository.find();
  }

  async findOne(id: number) {
    return await this.alimentoRepository.findOneBy({ id_insumo: id });
  }

  async update(id: number, updateAlimentoDto: UpdateAlimentoDto) {
    await this.alimentoRepository.update(id, updateAlimentoDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return await this.alimentoRepository.delete(id);
  }
}