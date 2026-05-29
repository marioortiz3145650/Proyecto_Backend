import { IsOptional, IsInt } from 'class-validator';
import { PaginationDto } from '../../common/dtos/pagination.dto';

export class AlimentosQueryDto extends PaginationDto {
  @IsOptional() @IsInt() tipo_alimento_id?: number;
}