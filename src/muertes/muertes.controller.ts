import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { MuertesService } from './muertes.service';
import { CreateMuerteDto } from './dto/create-muerte.dto';
import { UpdateMuerteDto } from './dto/update-muerte.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterMuerteDto } from './dto/filter-muerte.dto';

@Controller('muertes')
export class MuertesController {

  constructor(private readonly service: MuertesService) {}

  @Post()
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMuerteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}