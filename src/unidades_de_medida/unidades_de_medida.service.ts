import { Injectable } from '@nestjs/common';
import { CreateUnidadesDeMedidaDto } from './dto/create-unidades_de_medida.dto';
import { UpdateUnidadesDeMedidaDto } from './dto/update-unidades_de_medida.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnidadMedida } from './entities/unidades_de_medida.entity';

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

  async findAll() {
    return await this.unidadRepository.find();
  }

  async findOne(id: number) {
    return await this.unidadRepository.findOneBy({ id_unidad: id });
  }

  async update(id: number, dto: UpdateUnidadesDeMedidaDto) {
    await this.unidadRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return await this.unidadRepository.delete(id);
  }
}