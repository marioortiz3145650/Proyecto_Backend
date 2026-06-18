import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterAlertaDto {
  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsString()
  prioridad?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  leida?: boolean;
}