import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TipoDeAlimentosService } from './tipo_de_alimento.service';
import { CreateTipoDeAlimentoDto } from './dto/create-tipo_de_alimento.dto';
import { UpdateTipoDeAlimentoDto } from './dto/update-tipo_de_alimento.dto';

@Controller('tipo-de-alimentos')
export class TipoDeAlimentosController {

  constructor(private readonly service: TipoDeAlimentosService) {}

  @Post()
  create(@Body() dto: CreateTipoDeAlimentoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTipoDeAlimentoDto,
  ) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}