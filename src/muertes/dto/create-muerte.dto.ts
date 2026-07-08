import { IsDateString, IsInt, IsString, Min, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateMuerteDto {
  @IsDateString()
  fecha!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsString()
  causa!: string;

  @IsUUID()
  usuarioId!: string;

  @IsString()
  @IsNotEmpty()
  loteId!: string;
}
