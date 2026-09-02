import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { MuertesService } from './muertes.service';
import { CreateMuerteDto } from './dto/create-muerte.dto';
import { UpdateMuerteDto } from './dto/update-muerte.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterMuerteDto } from './dto/filter-muerte.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('muertes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MuertesController {

  constructor(private readonly service: MuertesService) {}

  @Post()
  @Roles('Administrador', 'Aprendiz')
  create(@Body() dto: CreateMuerteDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterMuerteDto,
  ) {
    return this.service.findAll(paginationDto, filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador')
  update(@Param('id') id: string, @Body() dto: UpdateMuerteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}