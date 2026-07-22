import { IsString, IsOptional } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  key!: string;

  @IsString()
  value!: string;
}

export class UpdateSettingDto {
  @IsString()
  @IsOptional()
  key?: string;

  @IsString()
  @IsOptional()
  value?: string;
}
