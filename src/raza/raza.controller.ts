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
import { BreedService } from './raza.service';
import { CreateBreedDto } from './dto/create-raza.dto';
import { UpdateBreedDto } from './dto/update-raza.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('breed')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BreedController {
  constructor(private readonly breedService: BreedService) {}

  @Post()
  @Roles('Administrador')
  create(@Body() createBreedDto: CreateBreedDto) {
    return this.breedService.create(createBreedDto);
  }

  @Get()
  findAll(@Query('all') all?: string) {
    return this.breedService.findAll(all === 'true');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.breedService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Aprendiz')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBreedDto: UpdateBreedDto) {
    return this.breedService.update(id, updateBreedDto);
  }

  @Delete(':id')
  @Roles('Administrador', 'Aprendiz')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.breedService.remove(id);
  }

  @Post(':id/restore')
  @Roles('Administrador', 'Aprendiz')
  @HttpCode(HttpStatus.OK)
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.breedService.restore(id);
  }
}