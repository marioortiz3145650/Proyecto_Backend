import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Galpon } from './entities/galpone.entity';
import { Lote } from '../lotes/entities/lote.entity';
import { CreateGalponDto } from './dto/create-galpone.dto';
import { UpdateGalponDto } from './dto/update-galpone.dto';

@Injectable()
export class GalponesService {
  constructor(
    @InjectRepository(Galpon)
    private galponRepository: Repository<Galpon>,
    @InjectRepository(Lote)
    private loteRepository: Repository<Lote>,
  ) {}

    async create(createGalponDto: CreateGalponDto) {
    if (createGalponDto.lote) {
      const lote = await this.loteRepository.findOne({
        where: { id_lote: createGalponDto.lote }
      });

      if (!lote) {
        throw new NotFoundException(`Lote con ID ${createGalponDto.lote} no encontrado`);
      }

      const galpon = this.galponRepository.create({
        nombre: createGalponDto.nombre,
        direccion: createGalponDto.direccion,
        lote,
      });

      return this.galponRepository.save(galpon);
    }

    const galpon = this.galponRepository.create({
      nombre: createGalponDto.nombre,
      direccion: createGalponDto.direccion,
    });

    return this.galponRepository.save(galpon);
  }

  async findAll() {
    return this.galponRepository.find({
      relations: ['lote'],
      order: { nombre: 'ASC' }
    });
  }

  async findOne(id: number) {
    const galpon = await this.galponRepository.findOne({
      where: { id_galpon: id },
      relations: ['lote'],
    });

    if (!galpon) {
      throw new NotFoundException(`Galpón con ID ${id} no encontrado`);
    }

    return galpon;
  }

  async findByLote(loteId: number) {
    return this.galponRepository.find({
      where: { lote: { id_lote: loteId } },
      relations: ['lote'],
    });
  }

  async update(id: number, updateGalponDto: UpdateGalponDto) {
    const galpon = await this.findOne(id);

    const updateData: Partial<Galpon> = {};

    if (updateGalponDto.nombre) {
      updateData.nombre = updateGalponDto.nombre;
    }

    if (updateGalponDto.direccion) {
      updateData.direccion = updateGalponDto.direccion;
    }

    // Si viene lote, verificar que existe
    if (updateGalponDto.lote) {
      const lote = await this.loteRepository.findOne({
        where: { id_lote: updateGalponDto.lote }
      });

      if (!lote) {
        throw new NotFoundException(`Lote con ID ${updateGalponDto.lote} no encontrado`);
      }

      updateData.lote = lote; 
    }

    await this.galponRepository.update({ id_galpon: id }, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    const galpon = await this.findOne(id);
    await this.galponRepository.delete({ id_galpon: id });
    return { message: `Galpón "${galpon.nombre}" eliminado correctamente` };
  }
}