import { PartialType } from '@nestjs/mapped-types';
import { CreateMovimientosInsumoDto } from './create-movimientos_insumo.dto';

export class UpdateMovimientosInsumoDto extends PartialType(CreateMovimientosInsumoDto) {}