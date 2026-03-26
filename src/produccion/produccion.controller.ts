import { Controller, Post, Body } from '@nestjs/common';
import { ProduccionService } from './produccion.service';
import { CreateProduccionDto } from './dto/create-produccion.dto';

@Controller('produccion') // Esta es la ruta que usaremos en Postman
export class ProduccionController {
  constructor(private readonly produccionService: ProduccionService) {}

  @Post()
  create(@Body() createProduccionDto: CreateProduccionDto) {
    return this.produccionService.create(createProduccionDto);
  }
}