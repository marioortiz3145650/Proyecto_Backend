import { IsOptional, IsInt } from 'class-validator';
import { PaginationDto } from '../../common/dtos/pagination.dto';

export class GalponesQueryDto extends PaginationDto {
  @IsOptional() @IsInt() lote_id?: number;
}