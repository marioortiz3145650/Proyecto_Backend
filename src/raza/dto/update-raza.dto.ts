import { PartialType } from '@nestjs/mapped-types';
import { CreateBreedDto } from './create-raza.dto';

export class UpdateBreedDto extends PartialType(CreateBreedDto) {}
