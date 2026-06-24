import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSiteServiceDto {
  @IsString()
  id: string;

  @IsString()
  icon: string;

  @IsString()
  titleRu: string;

  @IsString()
  titleEn: string;

  @IsString()
  descRu: string;

  @IsString()
  descEn: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpdateSiteServiceDto {
  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  titleRu?: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  descRu?: string;

  @IsOptional()
  @IsString()
  descEn?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}
