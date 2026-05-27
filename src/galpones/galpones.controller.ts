import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe,
  Query 
} from '@nestjs/common';
import { GalponesService } from './galpones.service';
import { CreateGalponDto } from './dto/create-galpone.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterGalponDto } from './dto/filter-galpon.dto';

@Controller('galpones')
export class GalponesController {
  constructor(private readonly galponesService: GalponesService) {}

  @Post()
  create(@Body() createGalponDto: CreateGalponDto) {
    return this.galponesService.create(createGalponDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterGalponDto,
  ) {
    return this.galponesService.findAll(paginationDto, filterDto);
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
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGalponDto: any) {
    return this.galponesService.update(id, updateGalponDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.galponesService.remove(id);
  }
}