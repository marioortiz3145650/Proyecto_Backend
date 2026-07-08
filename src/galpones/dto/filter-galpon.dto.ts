import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class FilterGalponDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  lote?: string;
}