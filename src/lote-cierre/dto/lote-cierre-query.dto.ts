import { IsOptional, IsInt } from 'class-validator';
import { PaginationDto } from '../../common/dtos/pagination.dto';

export class LoteCierreQueryDto extends PaginationDto {
  @IsOptional() @IsInt() lote_id?: number;
  @IsOptional() @IsInt() galpon_id?: number;
}