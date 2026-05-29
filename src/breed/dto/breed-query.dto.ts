import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dtos/pagination.dto';

export class BreedQueryDto extends PaginationDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() origin?: string;
}
