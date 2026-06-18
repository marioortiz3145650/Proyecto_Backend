import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UnidadesDeMedidaService } from './unidades_de_medida.service';
import { CreateUnidadesDeMedidaDto } from './dto/create-unidades_de_medida.dto';
import { UpdateUnidadesDeMedidaDto } from './dto/update-unidades_de_medida.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('unidades-de-medida')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UnidadesDeMedidaController {

  constructor(private readonly service: UnidadesDeMedidaService) {}

  @Post()
  @Roles('Administrador')
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
  @Roles('Administrador')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUnidadesDeMedidaDto,
  ) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}