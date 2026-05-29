import { 
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query 
} from '@nestjs/common';
import { ProduccionService } from './produccion.service';
import { CreateProduccionDto } from './dto/create-produccion.dto';
import { UpdateProduccionDto } from './dto/update-produccion.dto';
import { ProduccionQueryDto } from './dto/produccion-query.dto';

@Controller('produccion')
export class ProduccionController {
  constructor(private readonly produccionService: ProduccionService) {}

  @Post()
  create(@Body() createProduccionDto: CreateProduccionDto) {
    return this.produccionService.create(createProduccionDto);
  }

  @Get()
  findAll(@Query() query: ProduccionQueryDto) {
    return this.produccionService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.produccionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProduccionDto: UpdateProduccionDto) {
    return this.produccionService.update(id, updateProduccionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.produccionService.remove(id);
  }
}