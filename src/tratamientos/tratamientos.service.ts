import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTratamientoDto } from './dto/create-tratamiento.dto';
import { UpdateTratamientoDto } from './dto/update-tratamiento.dto';
import { Tratamiento } from './entities/tratamiento.entity';

@Injectable()
export class TratamientosService {
  constructor(
    @InjectRepository(Tratamiento)
    private readonly repo: Repository<Tratamiento>,
  ) {}

  async create(dto: CreateTratamientoDto) {
    const nuevo = this.repo.create({
      fecha: new Date(dto.fecha),
      tratamiento: dto.tratamiento,
      lote: { uuid: dto.lote_id } as any,
      creado_por: { uuid: dto.creado_por } as any,
    });
    return await this.repo.save(nuevo);
  }

  async findAll() {
    return await this.repo.find();
  }

  async findOne(uuid: string) {
    const registro = await this.repo.findOne({ where: { uuid } });
    if (!registro) throw new NotFoundException(`Tratamiento con UUID ${uuid} no existe`);
    return registro;
  }

  async update(uuid: string, updateDto: UpdateTratamientoDto) {
    const registro = await this.findOne(uuid);
    const updatedData: any = { ...updateDto };
    
    if (updateDto.fecha) {
      updatedData.fecha = new Date(updateDto.fecha);
    }
    if (updateDto.lote_id) {
      updatedData.lote = { uuid: updateDto.lote_id };
      delete updatedData.lote_id;
    }
    if (updateDto.creado_por) {
      updatedData.creado_por = { uuid: updateDto.creado_por };
      delete updatedData.creado_por;
    }
    
    this.repo.merge(registro, updatedData);
    return await this.repo.save(registro);
  }

  async remove(uuid: string) {
    const registro = await this.findOne(uuid);
    return await this.repo.remove(registro);
  }
}