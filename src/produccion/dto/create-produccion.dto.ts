import { IsDateString, IsInt, IsOptional, IsUUID, Min, IsString } from 'class-validator';

export class CreateProduccionDto {
  @IsDateString()
  fecha!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  jumbo?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  aaa?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  aa?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  a?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  b?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  c?: number;

  // El total lo calcularemos en el service, no hace falta pedirlo
  
  @IsString()
  lote_id!: string;

  @IsUUID() // El ID de usuario es un string (UUID)
  creado_por!: string;
}