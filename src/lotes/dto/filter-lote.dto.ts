import { IsOptional, IsInt, Min, IsBoolean, IsString } from 'class-validator';

export class FilterLoteDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  raza?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  edad_semanas_min?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  edad_semanas_max?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  produccion_pct_min?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  produccion_pct_max?: number;

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