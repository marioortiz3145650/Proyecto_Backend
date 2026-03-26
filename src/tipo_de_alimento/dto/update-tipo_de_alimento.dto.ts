import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoDeAlimentoDto } from './create-tipo_de_alimento.dto';

export class UpdateTipoDeAlimentoDto extends PartialType(CreateTipoDeAlimentoDto) {}