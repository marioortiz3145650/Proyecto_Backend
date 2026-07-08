import { IsString, IsInt, IsNumber, IsOptional } from 'class-validator';

export class CreateAlimentoDto {

  @IsString()
  nombre!: string;

  @IsString()
  tipo_alimento_id!: string;

  @IsString()
  unidad_medida_id!: string;

  @IsNumber()
  stock_actual!: number;

  @IsNumber()
  stock_minimo!: number;

  @IsOptional()
  @IsNumber()
  precio_unitario?: number;
}