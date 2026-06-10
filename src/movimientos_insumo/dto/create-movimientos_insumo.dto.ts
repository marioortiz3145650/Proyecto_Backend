import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateMovimientosInsumoDto {
  @IsString()
  @IsNotEmpty()
  fecha!: string;

  @IsNumber()
  @IsNotEmpty()
  cantidad!: number;

  @IsString()
  @IsNotEmpty()
  tipo_movimiento!: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsNumber()
  @IsNotEmpty()
  insumo_id!: number;

  @IsNumber()
  @IsNotEmpty()
  lote_id!: number;

  @IsString()
  @IsNotEmpty()
  creado_por!: string; 
}