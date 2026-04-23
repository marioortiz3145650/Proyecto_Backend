import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerta } from './entities/alerta.entity';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';

@Injectable()
export class AlertasService {
  constructor(
    @InjectRepository(Alerta)
    private alertasRepository: Repository<Alerta>,
  ) {}

  async findAll(): Promise<Alerta[]> {
    return this.alertasRepository.find();
  }

  async findOne(id: number): Promise<Alerta> {
    const alerta = await this.alertasRepository.findOne({ where: { id_alerta: id } });
    if (!alerta) {
      throw new NotFoundException(`Alerta con ID ${id} no encontrada`);
    }
    return alerta;
  }

  async create(createAlertaDto: CreateAlertaDto): Promise<Alerta> {
    const alerta = this.alertasRepository.create(createAlertaDto);
    return this.alertasRepository.save(alerta);
  }

  async update(id: number, updateAlertaDto: UpdateAlertaDto): Promise<Alerta> {
    const alerta = await this.findOne(id);
    Object.assign(alerta, updateAlertaDto);
    return this.alertasRepository.save(alerta);
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.alertasRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Alerta con ID ${id} no encontrada`);
    }
    return { message: `Alerta con ID ${id} eliminada correctamente` };
  }
}
