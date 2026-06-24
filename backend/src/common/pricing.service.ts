import { Injectable } from '@nestjs/common';
import { Promotion, PromotionProduct } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type ActivePromotion = Promotion & { products: PromotionProduct[] };

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async getActivePromotions(): Promise<ActivePromotion[]> {
    const now = new Date();
    return this.prisma.promotion.findMany({
      where: {
        active: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { products: true },
    });
  }

  getEffectiveUnitPrice(
    productId: string,
    basePrice: number,
    promotions: ActivePromotion[],
  ): number {
    let best = basePrice;

    for (const promo of promotions) {
      const productIds = promo.products.map((p) => p.productId);
      const applies = productIds.length === 0 || productIds.includes(productId);
      if (!applies || promo.discountPercent == null) continue;

      const discounted = basePrice * (1 - promo.discountPercent / 100);
      best = Math.min(best, discounted);
    }

    return Math.round(best * 100) / 100;
  }

  async priceProduct(productId: string, basePrice: number): Promise<number> {
    const promotions = await this.getActivePromotions();
    return this.getEffectiveUnitPrice(productId, basePrice, promotions);
  }
}
