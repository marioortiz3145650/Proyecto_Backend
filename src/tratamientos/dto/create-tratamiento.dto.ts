import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateTratamientoDto {
  @IsString()
  @IsNotEmpty()
  fecha!: string;

  @IsString()
  @IsNotEmpty()
  tratamiento!: string;

  @IsInt()
  lote_id!: number;

  @IsInt()
  estado_id!: number;

  @IsInt()
  creado_por!: number;
}