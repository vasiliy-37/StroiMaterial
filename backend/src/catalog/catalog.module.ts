import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { ProductsModule } from '../products/products.module';
import { SiteServicesModule } from '../site-services/site-services.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [ProductsModule, SiteServicesModule, PromotionsModule, ContentModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
