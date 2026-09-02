import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  key!: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsUUID()
  modificado_por?: string;
}

export class UpdateSettingDto {
  @IsString()
  @IsOptional()
  key?: string;

  @IsString()
  @IsOptional()
  value?: string;

  @IsOptional()
  @IsUUID()
  modificado_por?: string;
}
