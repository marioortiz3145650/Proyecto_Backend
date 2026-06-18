
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterAlertaDto } from './dto/filter-alerta.dto';

@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Post()
  create(@Body() createAlertaDto: CreateAlertaDto) {
    return this.alertasService.create(createAlertaDto);
  }

  @Get()
  findAll(@Query() query: any) {
    const paginationDto: PaginationDto = {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
      sortBy: query.sortBy || 'id_alerta',
      order: query.order || 'DESC',
    };

    const filterDto: FilterAlertaDto = {
      tipo: query.tipo,
      prioridad: query.prioridad,
    };

    if (query.leida === 'true') {
      filterDto.leida = true;
    } else if (query.leida === 'false') {
      filterDto.leida = false;
    }

    return this.alertasService.findAll(paginationDto, filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlertaDto: UpdateAlertaDto) {
    return this.alertasService.update(+id, updateAlertaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alertasService.remove(+id);
  }
}
