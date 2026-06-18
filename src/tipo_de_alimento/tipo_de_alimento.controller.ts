import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TipoDeAlimentosService } from './tipo_de_alimento.service';
import { CreateTipoDeAlimentoDto } from './dto/create-tipo_de_alimento.dto';
import { UpdateTipoDeAlimentoDto } from './dto/update-tipo_de_alimento.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tipo-de-alimentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TipoDeAlimentosController {

  constructor(private readonly service: TipoDeAlimentosService) {}

  @Post()
  @Roles('Administrador')
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
  @Roles('Administrador')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTipoDeAlimentoDto,
  ) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}