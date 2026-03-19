import { PartialType } from '@nestjs/mapped-types';
import { CreateGalponDto } from './create-galpone.dto';

export class UpdateGalponDto extends PartialType(CreateGalponDto) {}