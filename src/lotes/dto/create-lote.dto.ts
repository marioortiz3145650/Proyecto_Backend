import { 
  IsInt, 
  IsNumber, 
  IsDateString, 
  IsNotEmpty, 
  Min, 
  Max, 
  IsOptional,
  IsString
} from 'class-validator';

export class CreateLoteDto {
  @IsOptional()
  @IsString()
  raza?: string;

  @IsOptional()
  @IsString()
  raza_id?: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  edad_semanas!: number;


  @IsDateString()
  @IsNotEmpty()
  fecha_inicio!: string;

  @IsDateString()
  @IsOptional()
  fecha_fin?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  total_gallinas?: number;
}