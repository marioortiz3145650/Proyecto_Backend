import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { InquilinosService } from './inquilinos.service';
import { CrearInquilinoDto } from './dto/crear-inquilino.dto';
import { ActualizarInquilinoDto } from './dto/actualizar-inquilino.dto';
import { Inquilino } from './entities/inquilino.entity';

@Controller('inquilinos')
export class InquilinosController {
  constructor(private readonly inquilinosService: InquilinosService) {}

  @Post()
  crear(@Body() crearInquilinoDto: CrearInquilinoDto): Promise<Inquilino> {
    return this.inquilinosService.crear(crearInquilinoDto);
  }

  @Get()
  obtenerTodos(): Promise<Inquilino[]> {
    return this.inquilinosService.obtenerTodos();
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string): Promise<Inquilino> {
    return this.inquilinosService.obtenerUno(id);
  }

  @Put(':id')
  actualizar(@Param('id') id: string, @Body() actualizarInquilinoDto: ActualizarInquilinoDto): Promise<Inquilino> {
    return this.inquilinosService.actualizar(id, actualizarInquilinoDto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string): Promise<void> {
    return this.inquilinosService.eliminar(id);
  }
}