import { 
  IsString, 
  IsNotEmpty, 
  MaxLength,
  IsInt,
  Min,
  IsOptional 
} from 'class-validator';

export class CreateGalponDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  direccion: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  lote?: number;
}