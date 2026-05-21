import { IsString, IsEmail, MinLength, MaxLength, IsNotEmpty, IsUUID, IsOptional } from "class-validator";

export class CreateUsuarioDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsEmail()
  @MinLength(5)
  @MaxLength(100)
  @IsNotEmpty()  
  correo!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  nombre_usuario!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @IsNotEmpty()
  contraseña!: string;

  @IsUUID('4', { message: 'El rol debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El rol es requerido' })
  rol!: string;  
}