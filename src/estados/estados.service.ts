import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estado } from './entities/estado.entity';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';

@Injectable()
export class EstadosService {
  constructor(
    @InjectRepository(Estado)
    private estadoRepository: Repository<Estado>,
  ) {}

  async create(createEstadoDto: CreateEstadoDto) {
    const estado = this.estadoRepository.create(createEstadoDto);
    return this.estadoRepository.save(estado);
  }

  async findAll() {
    return this.estadoRepository.find({
      select: ['id', 'nombre']
    });
  }

  async findOne(id: number) {
    const estado = await this.estadoRepository.findOne({
      where: { id },
      select: ['id', 'nombre']
    });

    if (!estado) {
      throw new NotFoundException(`Estado con ID ${id} no encontrado`);
    }

    return estado;
  }

  async update(id: number, updateEstadoDto: UpdateEstadoDto) {
    await this.findOne(id);
    await this.estadoRepository.update({ id }, updateEstadoDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.estadoRepository.delete({ id });
    return { message: 'Estado eliminado correctamente' };
  }
}