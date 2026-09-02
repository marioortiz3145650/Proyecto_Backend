import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TratamientosService } from './tratamientos.service';
import { CreateTratamientoDto } from './dto/create-tratamiento.dto';
import { UpdateTratamientoDto } from './dto/update-tratamiento.dto';
import { FilterTratamientoDto } from './dto/filter-tratamiento.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tratamientos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TratamientosController {
  constructor(private readonly tratamientosService: TratamientosService) {}

  @Post()
  @Roles('Administrador', 'Aprendiz')
  create(@Body() createTratamientoDto: CreateTratamientoDto) {
    return this.tratamientosService.create(createTratamientoDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterTratamientoDto,
  ) {
    return this.tratamientosService.findAll(paginationDto, filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tratamientosService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador')
  update(@Param('id') id: string, @Body() updateTratamientoDto: UpdateTratamientoDto) {
    return this.tratamientosService.update(id, updateTratamientoDto);
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.tratamientosService.remove(id);
  }
}