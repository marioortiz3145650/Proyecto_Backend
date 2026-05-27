import { IsOptional, IsInt, IsString, Min } from 'class-validator';

export class FilterProduccionDto {
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
  jumbo_min?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  aaa_min?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  aa_min?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  a_min?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  b_min?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  c_min?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  total_min?: number;
}