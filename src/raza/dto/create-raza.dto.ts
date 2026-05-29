import { 
  IsString, 
  IsNotEmpty, 
  MaxLength,
  IsBoolean,
  IsOptional 
} from 'class-validator';

export class CreateBreedDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la raza es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre_raza!: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}