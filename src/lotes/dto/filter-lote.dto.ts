import { IsOptional, IsInt, Min, IsBoolean, IsString } from 'class-validator';

export class FilterLoteDto {
  @IsOptional()
  @IsString()
  raza?: string;

  @IsOptional()
  @IsString()
  raza_id?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  edad_semanas?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  edad_semanas_min?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  edad_semanas_max?: number;

  @IsOptional()
  @IsString()
  fecha_inicio?: string;

  @IsOptional()
  @IsString()
  fecha_fin?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}