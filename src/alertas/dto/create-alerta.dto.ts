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
  @IsInt()
  lote_id?: number;

  @IsOptional()
  @IsInt()
  galpon_id?: number;
}
