import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTipoDeAlimentoDto {

  @IsString()
  @IsNotEmpty()
  nombre!: string;
}