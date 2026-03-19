import { PartialType } from '@nestjs/mapped-types';
import { CreateUnidadesDeMedidaDto } from './create-unidades_de_medida.dto';

export class UpdateUnidadesDeMedidaDto extends PartialType(CreateUnidadesDeMedidaDto) {}