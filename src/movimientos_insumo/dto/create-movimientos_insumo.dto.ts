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

  @IsString()
  @IsNotEmpty()
  insumo_id!: string;

  @IsString()
  @IsNotEmpty()
  lote_id!: string;

  @IsString()
  @IsNotEmpty()
  creado_por!: string; 
}