import { IsString, IsInt, IsNumber, IsOptional } from 'class-validator';

export class CreateAlimentoDto {

  @IsString()
  nombre!: string;

  @IsInt()
  tipo_alimento_id!: number;

  @IsInt()
  unidad_medida_id!: number;

  @IsNumber()
  stock_actual!: number;

  @IsNumber()
  stock_minimo!: number;

  @IsOptional()
  @IsNumber()
  precio_unitario?: number;
}