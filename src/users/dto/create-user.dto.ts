// src/users/dto/create-user.dto.ts
import { IsString, IsEmail, MinLength, MaxLength, IsNotEmpty, IsUUID, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsEmail()
  @MinLength(5)
  @MaxLength(100)
  @IsNotEmpty()  
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @IsNotEmpty()
  password: string;

  @IsUUID('4', { message: 'El rol debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El rol es requerido' })
  rol: string;  
}