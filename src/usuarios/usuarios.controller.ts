import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('active')
  async findActive() {
    return this.usersService.findActive();
  }

  @Post()
  @Roles('Administrador')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usersService.create(createUsuarioDto);
  }

  @Get()
  @Roles('Administrador')
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterUsuarioDto,
  ) {
    return this.usersService.findAll(paginationDto, filterDto);
  }

  @Get(':id')
  @Roles('Administrador')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usersService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
