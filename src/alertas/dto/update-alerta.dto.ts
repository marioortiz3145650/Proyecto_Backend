import { PartialType } from '@nestjs/mapped-types';
import { CreateAlertaDto } from './create-alerta.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAlertaDto extends PartialType(CreateAlertaDto) {
  @IsOptional()
  @IsBoolean()
  leida?: boolean;
}

