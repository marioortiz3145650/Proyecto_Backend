import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe 
} from '@nestjs/common';
import { MovimientosInsumoService } from './movimientos_insumo.service';
import { CreateMovimientosInsumoDto } from './dto/create-movimientos_insumo.dto';
import { UpdateMovimientosInsumoDto } from './dto/update-movimientos_insumo.dto';
import { MovimientosInsumoQueryDto } from './dto/movimientos-insumo-query.dto';

@Controller('movimientos-insumo')
export class MovimientosInsumoController {
  constructor(private readonly movimientosInsumoService: MovimientosInsumoService) {}

  @Post()
  create(@Body() createMovimientosInsumoDto: CreateMovimientosInsumoDto) {
    return this.movimientosInsumoService.create(createMovimientosInsumoDto);
  }

  @Get()
  findAll(@Query() query: MovimientosInsumoQueryDto) {
    return this.movimientosInsumoService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movimientosInsumoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateDto: UpdateMovimientosInsumoDto
  ) {
    return this.movimientosInsumoService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.movimientosInsumoService.remove(id);
  }
}