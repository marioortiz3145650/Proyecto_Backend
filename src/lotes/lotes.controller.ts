import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { LotesService } from './lotes.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterLoteDto } from './dto/filter-lote.dto';

@Controller('lotes')
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  create(@Body() createLoteDto: CreateLoteDto) {
    return this.lotesService.create(createLoteDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterLoteDto,
  ) {
    return this.lotesService.findAll(paginationDto, filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lotesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLoteDto: UpdateLoteDto) {
    return this.lotesService.update(id, updateLoteDto);
  }

  @Post(':id/toggle')
  @HttpCode(HttpStatus.OK)
  toggleActivo(@Param('id') id: string) {
    return this.lotesService.toggleActivo(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lotesService.remove(id);
  }
}