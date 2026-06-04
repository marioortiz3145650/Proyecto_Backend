import { IsDateString, IsInt, IsString, Min, IsUUID } from 'class-validator';

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

  @IsInt()
  @Min(1)
  loteId!: number;
}
