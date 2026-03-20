import { Injectable } from '@nestjs/common';
import { CreateTipoDeAlimentoDto } from './dto/create-tipo_de_alimento.dto';
import { UpdateTipoDeAlimentoDto } from './dto/update-tipo_de_alimento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoDeAlimento } from './entities/tipo_de_alimento.entity';

@Injectable()
export class TipoDeAlimentosService {

  constructor(
    @InjectRepository(TipoDeAlimento)
    private tipoRepository: Repository<TipoDeAlimento>,
  ) {}

  async create(dto: CreateTipoDeAlimentoDto) {
    const tipo = this.tipoRepository.create(dto);
    return await this.tipoRepository.save(tipo);
  }

  async findAll() {
    return await this.tipoRepository.find();
  }

  async findOne(id: number) {
    return await this.tipoRepository.findOneBy({ id_tipo_insumo: id });
  }

  async update(id: number, dto: UpdateTipoDeAlimentoDto) {
    await this.tipoRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return await this.tipoRepository.delete(id);
  }
}