import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquilino } from './entities/inquilino.entity';
import { CrearInquilinoDto } from './dto/crear-inquilino.dto';
import { ActualizarInquilinoDto } from './dto/actualizar-inquilino.dto';

@Injectable()
export class InquilinosService {
  constructor(
    @InjectRepository(Inquilino)
    private inquilinoRepository: Repository<Inquilino>,
  ) {}

  async crear(crearInquilinoDto: CrearInquilinoDto): Promise<Inquilino> {
    const inquilino = this.inquilinoRepository.create(crearInquilinoDto);
    return this.inquilinoRepository.save(inquilino);
  }

  async obtenerTodos(): Promise<Inquilino[]> {
    return this.inquilinoRepository.find();
  }

  async obtenerUno(id: string): Promise<Inquilino> {
    const inquilino = await this.inquilinoRepository.findOne({ where: { id } });
    if (!inquilino) {
      throw new NotFoundException(`Inquilino con ID ${id} no encontrado`);
    }
    return inquilino;
  }

  async actualizar(id: string, actualizarInquilinoDto: ActualizarInquilinoDto): Promise<Inquilino> {
    const inquilino = await this.obtenerUno(id);
    Object.assign(inquilino, actualizarInquilinoDto);
    return this.inquilinoRepository.save(inquilino);
  }

  async eliminar(id: string): Promise<void> {
    const inquilino = await this.obtenerUno(id);
    await this.inquilinoRepository.remove(inquilino);
  }
}