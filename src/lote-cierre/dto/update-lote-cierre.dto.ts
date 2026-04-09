import { PartialType } from '@nestjs/mapped-types';
import { CreateLoteCierreDto } from './create-lote-cierre.dto';

export class UpdateLoteCierreDto extends PartialType(CreateLoteCierreDto) {}
