import { 
  IsInt, 
  IsDecimal, 
  IsDate, 
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
  @Min(0)
  @IsNotEmpty()
  edad_semanas!: number;

  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  @Max(100)
  @IsOptional()
  produccion_pct?: number;

  @IsDate()
  @IsNotEmpty()
  fecha_inicio!: Date;

  @IsDate()
  @IsOptional()
  fecha_fin?: Date;
}