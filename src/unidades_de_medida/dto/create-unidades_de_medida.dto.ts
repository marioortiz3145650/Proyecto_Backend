import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUnidadesDeMedidaDto {

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  abreviatura!: string;
}