import { PartialType } from '@nestjs/mapped-types';
import { CreateTratamientoDto } from './create-tratamiento.dto';
import { IsOptional, IsDateString } from 'class-validator';

export class UpdateTratamientoDto extends PartialType(CreateTratamientoDto) {
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  tratamiento?: string;

  @IsOptional()
  lote_id?: string;

  @IsOptional()
  creado_por?: string;
}
 