import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LoteCierreService } from './lote-cierre.service';
import { CreateLoteCierreDto } from './dto/create-lote-cierre.dto';
import { UpdateLoteCierreDto } from './dto/update-lote-cierre.dto';

@Controller('lote-cierre')
export class LoteCierreController {
  constructor(private readonly loteCierreService: LoteCierreService) {}

  @Post()
  create(@Body() createLoteCierreDto: CreateLoteCierreDto) {
    return this.loteCierreService.create(createLoteCierreDto);
  }

  @Get()
  findAll() {
    return this.loteCierreService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loteCierreService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLoteCierreDto: UpdateLoteCierreDto) {
    return this.loteCierreService.update(+id, updateLoteCierreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loteCierreService.remove(+id);
  }
}
