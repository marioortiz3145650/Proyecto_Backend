import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateAlertaDto {
  @IsString()
  titulo!: string;

  @IsString()
  mensaje!: string;

  @IsString()
  tipo!: string;

  @IsString()
  prioridad!: string;

  @IsOptional()
  @IsString()
  lote_id?: string;

  @IsOptional()
  @IsString()
  galpon_id?: string;
}
