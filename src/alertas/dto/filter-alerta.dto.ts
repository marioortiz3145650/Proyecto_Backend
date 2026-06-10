import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class FilterAlertaDto {
  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsString()
  prioridad?: string;

  @IsOptional()
  @IsBoolean()
  leida?: boolean;
}
