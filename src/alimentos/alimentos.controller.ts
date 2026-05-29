import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe 
} from '@nestjs/common';
import { AlimentosService } from './alimentos.service';
import { CreateAlimentoDto } from './dto/create-alimento.dto';
import { UpdateAlimentoDto } from './dto/update-alimento.dto';
import { AlimentosQueryDto } from './dto/alimentos-query.dto';

@Controller('alimentos')
export class AlimentosController {
  constructor(private readonly alimentosService: AlimentosService) {}

  @Post()
  create(@Body() createAlimentoDto: CreateAlimentoDto) {
    return this.alimentosService.create(createAlimentoDto);
  }

  @Get()
  findAll(@Query() query: AlimentosQueryDto) {
    return this.alimentosService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alimentosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateAlimentoDto: UpdateAlimentoDto
  ) {
    return this.alimentosService.update(id, updateAlimentoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alimentosService.remove(id);
  }
}