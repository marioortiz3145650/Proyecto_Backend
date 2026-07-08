import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTratamientoDto {
  @IsString()
  @IsNotEmpty()
  fecha!: string;

  @IsString()
  @IsNotEmpty()
  tratamiento!: string;

  @IsString()
  @IsNotEmpty()
  lote_id!: string;

  @IsString()
  @IsNotEmpty()
  creado_por!: string;
}