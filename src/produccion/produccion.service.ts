import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProduccionDto } from './dto/create-produccion.dto';
import { Produccion } from './entities/produccion.entity';

@Injectable()
export class ProduccionService {
  constructor(
    @InjectRepository(Produccion)
    private readonly produccionRepository: Repository<Produccion>,
  ) {}

  async create(createProduccionDto: CreateProduccionDto) {
    // 1. Extraemos los valores o les ponemos 0 si vienen vacíos
    const { 
      jumbo = 0, aaa = 0, aa = 0, a = 0, b = 0, c = 0, 
      lote_id, creado_por, fecha 
    } = createProduccionDto;

    // 2. Calculamos el TOTAL automáticamente
    const total = jumbo + aaa + aa + a + b + c;

    // 3. Creamos el objeto para la base de datos
    const nuevaProduccion = this.produccionRepository.create({
      fecha,
      jumbo,
      aaa,
      aa,
      a,
      b,
      c,
      total, // Aquí va la suma automática
      lote: { id_lote: lote_id }, // Relación con el ID del Lote (number)
      creado_por: { id: creado_por }, // Relación con el UUID del Usuario
    });

    // 4. Guardamos en Postgres
    return await this.produccionRepository.save(nuevaProduccion);
  }

  // Los demás métodos (findAll, findOne...) los puedes dejar como están por ahora
}