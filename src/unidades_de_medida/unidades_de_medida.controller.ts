import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UnidadesDeMedidaService } from './unidades_de_medida.service';
import { CreateUnidadesDeMedidaDto } from './dto/create-unidades_de_medida.dto';
import { UpdateUnidadesDeMedidaDto } from './dto/update-unidades_de_medida.dto';

@Controller('unidades-de-medida')
export class UnidadesDeMedidaController {

  constructor(private readonly service: UnidadesDeMedidaService) {}

  @Post()
  create(@Body() dto: CreateUnidadesDeMedidaDto) {
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
    @Body() dto: UpdateUnidadesDeMedidaDto,
  ) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}