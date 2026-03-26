import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MovimientosInsumoService } from './movimientos_insumo.service';
import { CreateMovimientosInsumoDto } from './dto/create-movimientos_insumo.dto';
import { UpdateMovimientosInsumoDto } from './dto/update-movimientos_insumo.dto';

@Controller('movimientos-insumo')
export class MovimientosInsumoController {
  constructor(private readonly movimientosInsumoService: MovimientosInsumoService) {}

  @Post()
  create(@Body() createMovimientosInsumoDto: CreateMovimientosInsumoDto) {
    return this.movimientosInsumoService.create(createMovimientosInsumoDto);
  }

  @Get()
  findAll() {
    return this.movimientosInsumoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movimientosInsumoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovimientosInsumoDto: UpdateMovimientosInsumoDto) {
    return this.movimientosInsumoService.update(+id, updateMovimientosInsumoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movimientosInsumoService.remove(+id);
  }
}