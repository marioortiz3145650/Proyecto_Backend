import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe 
} from '@nestjs/common';
import { GalponesService } from './galpones.service';
import { CreateGalponDto } from './dto/create-galpone.dto';
import { UpdateGalponDto } from './dto/update-galpone.dto';

@Controller('galpones')
export class GalponesController {
  constructor(private readonly galponesService: GalponesService) {}

  @Post()
  create(@Body() createGalponDto: CreateGalponDto) {
    return this.galponesService.create(createGalponDto);
  }

  @Get()
  findAll() {
    return this.galponesService.findAll();
  }

  @Get('lote/:loteId')
  findByLote(@Param('loteId', ParseIntPipe) loteId: number) {
    return this.galponesService.findByLote(loteId);
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