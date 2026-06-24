import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BulkContentDto, UpdateContentDto, UpdateHeroDto } from './dto/content.dto';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getHeroImage(): Promise<string> {
    const settings = await this.prisma.siteSettings.findUnique({ where: { id: 'default' } });
    return settings?.heroImage ?? '';
  }

  async setHeroImage(dto: UpdateHeroDto) {
    const settings = await this.prisma.siteSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', heroImage: dto.heroImage },
      update: { heroImage: dto.heroImage },
    });
    return { heroImage: settings.heroImage };
  }

  async getContentByLang(lang: string): Promise<Record<string, string>> {
    const entries = await this.prisma.contentEntry.findMany({ where: { lang } });
    return Object.fromEntries(entries.map((e) => [e.key, e.value]));
  }

  async getAllContent(): Promise<{ contentRu: Record<string, string>; contentEn: Record<string, string> }> {
    const [contentRu, contentEn] = await Promise.all([
      this.getContentByLang('ru'),
      this.getContentByLang('en'),
    ]);
    return { contentRu, contentEn };
  }

  async updateEntry(dto: UpdateContentDto) {
    await Promise.all([
      this.prisma.contentEntry.upsert({
        where: { key_lang: { key: dto.key, lang: 'ru' } },
        create: { key: dto.key, lang: 'ru', value: dto.ru },
        update: { value: dto.ru },
      }),
      this.prisma.contentEntry.upsert({
        where: { key_lang: { key: dto.key, lang: 'en' } },
        create: { key: dto.key, lang: 'en', value: dto.en },
        update: { value: dto.en },
      }),
    ]);
    return { ok: true };
  }

  async bulkUpdate(dto: BulkContentDto) {
    const ops = [
      ...Object.entries(dto.contentRu).map(([key, value]) =>
        this.prisma.contentEntry.upsert({
          where: { key_lang: { key, lang: 'ru' } },
          create: { key, lang: 'ru', value },
          update: { value },
        }),
      ),
      ...Object.entries(dto.contentEn).map(([key, value]) =>
        this.prisma.contentEntry.upsert({
          where: { key_lang: { key, lang: 'en' } },
          create: { key, lang: 'en', value },
          update: { value },
        }),
      ),
    ];
    await this.prisma.$transaction(ops);
    return { ok: true };
  }
}
