import { IsString } from 'class-validator';

export class CreateUnidadesDeMedidaDto {

  @IsString()
  nombre!: string;

  @IsString()
  abreviatura!: string;
}