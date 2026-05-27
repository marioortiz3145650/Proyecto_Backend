import { IsOptional, IsInt, IsString, Min } from 'class-validator';

export class FilterMuerteDto {
  @IsOptional()
  @IsString()
  fecha?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  lote?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cantidad_min?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cantidad_max?: number;

  @IsOptional()
  @IsString()
  causa?: string;
}