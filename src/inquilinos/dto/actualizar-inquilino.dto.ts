import { PartialType } from '@nestjs/mapped-types';
import { CrearInquilinoDto } from './crear-inquilino.dto';

export class ActualizarInquilinoDto extends PartialType(CrearInquilinoDto) {}