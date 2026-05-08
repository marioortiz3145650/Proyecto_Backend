import { PartialType } from '@nestjs/mapped-types';
import { CreateMuerteDto } from './create-muerte.dto';
import { IsDate, IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateMuerteDto extends PartialType(CreateMuerteDto) {
    @IsDate()
    @IsOptional()
    fecha?: Date;

    @IsInt()
    @IsOptional()
    cantidad?: number;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    causa?: string;

    @IsInt()
    @IsOptional()
    loteId?: number;

    @IsString()
    @IsOptional()
    usuarioId?: string;
}
