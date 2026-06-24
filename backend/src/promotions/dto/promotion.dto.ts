import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PromotionType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
  @IsString()
  id: string;

  @IsString()
  titleRu: string;

  @IsString()
  titleEn: string;

  @IsString()
  descriptionRu: string;

  @IsString()
  descriptionEn: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  discountPercent?: number;

  @IsEnum(PromotionType)
  type: PromotionType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];
}

export class UpdatePromotionDto {
  @IsOptional()
  @IsString()
  titleRu?: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  descriptionRu?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  discountPercent?: number;

  @IsOptional()
  @IsEnum(PromotionType)
  type?: PromotionType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];
}
