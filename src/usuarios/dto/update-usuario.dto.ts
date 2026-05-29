import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsUUID('4', { message: 'El rol debe ser un UUID válido' })
  @IsOptional()
  rol?: string;
}