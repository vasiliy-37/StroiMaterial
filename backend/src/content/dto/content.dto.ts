import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateContentDto {
  @IsString()
  key: string;

  @IsString()
  ru: string;

  @IsString()
  en: string;
}

export class UpdateHeroDto {
  @IsString()
  heroImage: string;
}

export class BulkContentDto {
  @IsObject()
  contentRu: Record<string, string>;

  @IsObject()
  contentEn: Record<string, string>;
}
