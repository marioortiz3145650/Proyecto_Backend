import { IsString, MinLength, MaxLength, IsNotEmpty } from "class-validator";

export class CreateRolDto {

    @IsString()
    @MinLength(3)
    @MaxLength(100)
    @IsNotEmpty()
    nombre: string;

}
