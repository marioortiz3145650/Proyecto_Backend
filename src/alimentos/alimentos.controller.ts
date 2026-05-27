import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AlimentosService } from './alimentos.service';
import { CreateAlimentoDto } from './dto/create-alimento.dto';
import { UpdateAlimentoDto } from './dto/update-alimento.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterAlimentoDto } from './dto/filter-alimento.dto';

@Controller('alimentos')
export class AlimentosController {

  constructor(private readonly alimentosService: AlimentosService) {}

  @Post()
  create(@Body() createAlimentoDto: CreateAlimentoDto) {
    return this.alimentosService.create(createAlimentoDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterAlimentoDto,
  ) {
    return this.alimentosService.findAll(paginationDto, filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alimentosService.findOne(Number(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAlimentoDto: UpdateAlimentoDto,
  ) {
    return this.alimentosService.update(Number(id), updateAlimentoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alimentosService.remove(Number(id));
  }
}