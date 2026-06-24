import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { SiteServicesService } from '../site-services/site-services.service';
import { PromotionsService } from '../promotions/promotions.service';
import { ContentService } from '../content/content.service';
import { CatalogStateDto } from '../common/mappers/catalog.mapper';

@Injectable()
export class CatalogService {
  constructor(
    private readonly products: ProductsService,
    private readonly services: SiteServicesService,
    private readonly promotions: PromotionsService,
    private readonly content: ContentService,
  ) {}

  async getCatalogState(): Promise<CatalogStateDto> {
    const [products, services, promotions, texts, heroImage] = await Promise.all([
      this.products.findAll({ activeOnly: true }),
      this.services.findAll(true),
      this.promotions.findAll(true),
      this.content.getAllContent(),
      this.content.getHeroImage(),
    ]);
    return {
      products,
      services,
      promotions,
      contentRu: texts.contentRu,
      contentEn: texts.contentEn,
      heroImage,
    };
  }
}
