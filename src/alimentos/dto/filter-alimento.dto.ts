import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class FilterAlimentoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  tipo_alimento?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  unidad_medida?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_actual_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_actual_max?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_minimo?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio_unitario_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio_unitario_max?: number;
  
  @IsOptional()
  @IsNumber()
  @Min(1)
  id_insumo?: number;
}