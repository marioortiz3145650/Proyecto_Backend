import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MovimientosInsumoService } from './movimientos_insumo.service';
import { CreateMovimientosInsumoDto } from './dto/create-movimientos_insumo.dto';
import { UpdateMovimientosInsumoDto } from './dto/update-movimientos_insumo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('movimientos-insumo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MovimientosInsumoController {
  constructor(private readonly movimientosInsumoService: MovimientosInsumoService) {}

  @Post()
  @Roles('Administrador', 'Aprendiz')
  create(@Body() createMovimientosInsumoDto: CreateMovimientosInsumoDto) {
    return this.movimientosInsumoService.create(createMovimientosInsumoDto);
  }

  @Get()
  findAll() {
    return this.movimientosInsumoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movimientosInsumoService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador')
  update(@Param('id') id: string, @Body() updateMovimientosInsumoDto: UpdateMovimientosInsumoDto) {
    return this.movimientosInsumoService.update(id, updateMovimientosInsumoDto);
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.movimientosInsumoService.remove(id);
  }
}
