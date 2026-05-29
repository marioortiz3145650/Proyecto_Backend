import { IsOptional, IsInt, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dtos/pagination.dto';

export class MovimientosInsumoQueryDto extends PaginationDto {
  @IsOptional() @IsInt() lote_id?: number;
  @IsOptional() @IsInt() insumo_id?: number;
  @IsOptional() @IsString() tipo_movimiento?: string;
}