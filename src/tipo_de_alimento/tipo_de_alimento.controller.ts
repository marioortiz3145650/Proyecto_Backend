import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { TipoDeAlimentosService } from './tipo_de_alimento.service';
import { CreateTipoDeAlimentoDto } from './dto/create-tipo_de_alimento.dto';
import { UpdateTipoDeAlimentoDto } from './dto/update-tipo_de_alimento.dto';
import { TipoDeAlimentoQueryDto } from './dto/tipo-de-alimento-query.dto';

@Controller('tipo-de-alimentos')
export class TipoDeAlimentosController {

  constructor(private readonly service: TipoDeAlimentosService) {}

  @Post()
  create(@Body() dto: CreateTipoDeAlimentoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: TipoDeAlimentoQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoDeAlimentoDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}