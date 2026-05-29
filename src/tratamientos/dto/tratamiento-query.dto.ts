import { IsOptional, IsInt } from 'class-validator';
import { PaginationDto } from '../../common/dtos/pagination.dto';

export class TratamientoQueryDto extends PaginationDto {
  @IsOptional() @IsInt() lote_id?: number;
  @IsOptional() @IsInt() estado_id?: number;
}
