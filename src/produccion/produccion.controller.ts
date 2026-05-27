import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ProduccionService } from './produccion.service';
import { CreateProduccionDto } from './dto/create-produccion.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterProduccionDto } from './dto/filter-produccion.dto';

@Controller('produccion') // Esta es la ruta que usaremos en Postman
export class ProduccionController {
  constructor(private readonly produccionService: ProduccionService) {}

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterProduccionDto,
  ) {
    return this.produccionService.findAll(paginationDto, filterDto);
  }

  @Post()
  create(@Body() createProduccionDto: CreateProduccionDto) {
    return this.produccionService.create(createProduccionDto);
  }
}
