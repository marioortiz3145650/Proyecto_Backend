import { IsOptional, IsInt } from 'class-validator';
import { PaginationDto } from '../../common/dtos/pagination.dto';

export class LotesQueryDto extends PaginationDto {
  @IsOptional() @IsInt() raza_id?: number;
}