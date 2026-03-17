// src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsUUID('4', { message: 'El rol debe ser un UUID válido' })
  @IsOptional()
  rol?: string;
}