import { IsString } from 'class-validator';

export class CreateTipoDeAlimentoDto {

  @IsString()
  nombre!: string;
}