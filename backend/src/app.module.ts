import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { SiteServicesModule } from './site-services/site-services.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ContentModule } from './content/content.module';
import { CatalogModule } from './catalog/catalog.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { HealthController } from './health/health.controller';
import { PricingModule } from './common/pricing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PricingModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    SiteServicesModule,
    PromotionsModule,
    ContentModule,
    CatalogModule,
    CartModule,
    OrdersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
