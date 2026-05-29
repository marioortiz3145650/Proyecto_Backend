import { IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dtos/pagination.dto';

export class TipoDeAlimentoQueryDto extends PaginationDto {
  // El filtro search está en PaginationDto
}
