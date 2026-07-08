import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProduccionService } from './produccion.service';
import { CreateProduccionDto } from './dto/create-produccion.dto';
import { UpdateProduccionDto } from './dto/update-produccion.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterProduccionDto } from './dto/filter-produccion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('produccion') // Esta es la ruta que usaremos en Postman
@UseGuards(JwtAuthGuard, RolesGuard)
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
  @Roles('Administrador', 'Aprendiz')
  create(@Body() createProduccionDto: CreateProduccionDto) {
    return this.produccionService.create(createProduccionDto);
  }

  @Patch(':id')
  @Roles('Administrador', 'Aprendiz')
  update(@Param('id') id: string, @Body() updateProduccionDto: UpdateProduccionDto) {
    return this.produccionService.update(id, updateProduccionDto);
  }

  @Delete(':id')
  @Roles('Administrador', 'Aprendiz')
  remove(@Param('id') id: string) {
    return this.produccionService.remove(id);
  }
}
