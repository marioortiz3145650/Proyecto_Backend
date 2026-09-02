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
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { LotesService } from './lotes.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterLoteDto } from './dto/filter-lote.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('lotes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  @Roles('Administrador', 'Aprendiz')
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
  @Roles('Administrador')
  update(@Param('id') id: string, @Body() updateLoteDto: UpdateLoteDto) {
    return this.lotesService.update(id, updateLoteDto);
  }

  @Post(':id/toggle')
  @HttpCode(HttpStatus.OK)
  @Roles('Administrador')
  toggleActivo(@Param('id') id: string) {
    return this.lotesService.toggleActivo(id);
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.lotesService.remove(id);
  }
}