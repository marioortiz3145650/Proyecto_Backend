import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class FilterGalponDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  lote?: number;
}