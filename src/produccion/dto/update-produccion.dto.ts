import { PartialType } from '@nestjs/mapped-types';
import { CreateProduccionDto } from './create-produccion.dto';

export class UpdateProduccionDto extends PartialType(CreateProduccionDto) {}
