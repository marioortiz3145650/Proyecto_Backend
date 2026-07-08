import { PartialType } from '@nestjs/mapped-types';
import { CreateMuerteDto } from './create-muerte.dto';
import { IsDateString, IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateMuerteDto extends PartialType(CreateMuerteDto) {
    @IsDateString()
    @IsOptional()
    fecha?: string;

    @IsInt()
    @IsOptional()
    cantidad?: number;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    causa?: string;

    @IsString()
    @IsOptional()
    loteId?: string;

    @IsString()
    @IsOptional()
    usuarioId?: string;
}
