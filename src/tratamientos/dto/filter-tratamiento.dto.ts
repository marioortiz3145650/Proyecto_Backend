import { IsOptional, IsString } from 'class-validator';

export class FilterTratamientoDto {
  @IsOptional()
  @IsString()
  lote?: string;

  @IsOptional()
  @IsString()
  fecha?: string;

  @IsOptional()
  @IsString()
  tratamiento?: string;

  @IsOptional()
  @IsString()
  fecha_inicio?: string;

  @IsOptional()
  @IsString()
  fecha_fin?: string;
}
