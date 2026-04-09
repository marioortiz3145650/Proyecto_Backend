import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTratamientoDto } from './dto/create-tratamiento.dto';
import { UpdateTratamientoDto } from './dto/update-tratamiento.dto'; // Asegúrate de tener este DTO
import { Tratamiento } from './entities/tratamiento.entity';

@Injectable()
export class TratamientosService {
  constructor(
    @InjectRepository(Tratamiento)
    private readonly repo: Repository<Tratamiento>,
  ) {}

  async create(dto: CreateTratamientoDto) {
    const nuevo = this.repo.create({
      ...dto,
      fecha: new Date(dto.fecha)
    });
    return await this.repo.save(nuevo);
  }

  async findAll() {
    return await this.repo.find();
  }

  // --- ESTOS SON LOS QUE FALTABAN ---
  async findOne(id: number) {
    const registro = await this.repo.findOne({ where: { id_tratamiento: id } });
    if (!registro) throw new NotFoundException(`Tratamiento #${id} no existe`);
    return registro;
  }

  async update(id: number, updateDto: UpdateTratamientoDto) {
    const registro = await this.findOne(id);
    this.repo.merge(registro, updateDto as any);
    return await this.repo.save(registro);
  }

  async remove(id: number) {
    const registro = await this.findOne(id);
    return await this.repo.remove(registro);
  }
}