import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe,
  Post as HttpPost,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { BreedService } from './raza.service';
import { CreateBreedDto } from './dto/create-raza.dto';
import { UpdateBreedDto } from './dto/update-raza.dto';

@Controller('breed')
export class BreedController {
  constructor(private readonly breedService: BreedService) {}

  @Post()
  create(@Body() createBreedDto: CreateBreedDto) {
    return this.breedService.create(createBreedDto);
  }

  @Get()
  findAll() {
    return this.breedService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.breedService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBreedDto: UpdateBreedDto) {
    return this.breedService.update(id, updateBreedDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.breedService.remove(id);
  }

  @HttpPost(':id/restore')
  @HttpCode(HttpStatus.OK)
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.breedService.restore(id);
  }
}