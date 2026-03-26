import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateProduccionDto {
  @IsDateString()
  fecha: string;

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
  
  @IsInt() // Recuerda que el ID de Lote es un número
  lote_id: number;

  @IsUUID() // El ID de usuario es un string (UUID)
  creado_por: string;
}