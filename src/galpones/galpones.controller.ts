import { 
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query 
} from '@nestjs/common';
import { GalponesService } from './galpones.service';
import { CreateGalponDto } from './dto/create-galpone.dto';
import { UpdateGalponDto } from './dto/update-galpone.dto';
import { GalponesQueryDto } from './dto/galpones-query.dto';

@Controller('galpones')
export class GalponesController {
  constructor(private readonly galponesService: GalponesService) {}

  @Post()
  create(@Body() createGalponDto: CreateGalponDto) {
    return this.galponesService.create(createGalponDto);
  }

  @Get()
  findAll(@Query() query: GalponesQueryDto) {
    return this.galponesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.galponesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGalponDto: UpdateGalponDto) {
    return this.galponesService.update(id, updateGalponDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.galponesService.remove(id);
  }
}