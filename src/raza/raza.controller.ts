import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards
} from '@nestjs/common';
import { RazaService } from './raza.service';
import { CreateRazaDto } from './dto/create-raza.dto';
import { UpdateRazaDto } from './dto/update-raza.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('breed')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RazaController {
  constructor(private readonly razaService: RazaService) {}

  @Post()
  @Roles('Administrador')
  create(@Body() createRazaDto: CreateRazaDto) {
    return this.razaService.create(createRazaDto);
  }

  @Get()
  findAll(@Query('all') all?: string) {
    return this.razaService.findAll(all === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.razaService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador')
  update(@Param('id') id: string, @Body() updateRazaDto: UpdateRazaDto) {
    return this.razaService.update(id, updateRazaDto);
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.razaService.remove(id);
  }

  @Post(':id/restore')
  @Roles('Administrador')
  @HttpCode(HttpStatus.OK)
  restore(@Param('id') id: string) {
    return this.razaService.restore(id);
  }
}