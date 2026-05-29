import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { UnidadesDeMedidaService } from './unidades_de_medida.service';
import { CreateUnidadesDeMedidaDto } from './dto/create-unidades_de_medida.dto';
import { UpdateUnidadesDeMedidaDto } from './dto/update-unidades_de_medida.dto';
import { UnidadesDeMedidaQueryDto } from './dto/unidades-de-medida-query.dto';

@Controller('unidades-de-medida')
export class UnidadesDeMedidaController {

  constructor(private readonly service: UnidadesDeMedidaService) {}

  @Post()
  create(@Body() dto: CreateUnidadesDeMedidaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: UnidadesDeMedidaQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUnidadesDeMedidaDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}