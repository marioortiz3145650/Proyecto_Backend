import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AlimentosService } from './alimentos.service';
import { CreateAlimentoDto } from './dto/create-alimento.dto';
import { UpdateAlimentoDto } from './dto/update-alimento.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterAlimentoDto } from './dto/filter-alimento.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('alimentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlimentosController {

  constructor(private readonly alimentosService: AlimentosService) {}

  @Post()
  @Roles('Administrador')
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
    return this.alimentosService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador')
  update(
    @Param('id') id: string,
    @Body() updateAlimentoDto: UpdateAlimentoDto,
  ) {
    return this.alimentosService.update(id, updateAlimentoDto);
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.alimentosService.remove(id);
  }
}