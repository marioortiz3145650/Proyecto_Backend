import { 
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query 
} from '@nestjs/common';
import { LoteCierreService } from './lote-cierre.service';
import { CreateLoteCierreDto } from './dto/create-lote-cierre.dto';
import { UpdateLoteCierreDto } from './dto/update-lote-cierre.dto';
import { LoteCierreQueryDto } from './dto/lote-cierre-query.dto';

@Controller('lote-cierre')
export class LoteCierreController {
  constructor(private readonly loteCierreService: LoteCierreService) {}

  @Post()
  create(@Body() createLoteCierreDto: CreateLoteCierreDto) {
    return this.loteCierreService.create(createLoteCierreDto);
  }

  @Get()
  findAll(@Query() query: LoteCierreQueryDto) {
    return this.loteCierreService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loteCierreService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateLoteCierreDto: UpdateLoteCierreDto
  ) {
    return this.loteCierreService.update(id, updateLoteCierreDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.loteCierreService.remove(id);
  }
}