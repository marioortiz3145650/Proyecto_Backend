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
  UseGuards
} from '@nestjs/common';
import { GalponesService } from './galpones.service';
import { CreateGalponDto } from './dto/create-galpone.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterGalponDto } from './dto/filter-galpon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('galpones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GalponesController {
  constructor(private readonly galponesService: GalponesService) {}

  @Post()
  @Roles('Administrador', 'Aprendiz')
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
  findByLote(@Param('loteId') loteId: string) {
    return this.galponesService.findByLote(loteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.galponesService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador')
  update(@Param('id') id: string, @Body() updateGalponDto: any) {
    return this.galponesService.update(id, updateGalponDto);
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.galponesService.remove(id);
  }
}