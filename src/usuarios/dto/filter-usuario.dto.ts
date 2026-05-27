import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';

export class FilterUsuarioDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  correo?: string;

  @IsOptional()
  @IsString()
  nombre_usuario?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  rol?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  fecha_registro_inicio?: string;

  @IsOptional()
  @IsString()
  fecha_registro_fin?: string;
}