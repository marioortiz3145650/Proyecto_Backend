import { 
  IsInt, 
  IsNumber, 
  IsDateString, 
  IsNotEmpty, 
  Min, 
  Max, 
  IsOptional 
} from 'class-validator';

export class CreateLoteDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  raza?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  raza_id?: number;

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