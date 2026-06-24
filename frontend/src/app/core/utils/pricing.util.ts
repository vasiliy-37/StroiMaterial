import { Product, Promotion } from '../models/catalog.models';

export function getEffectiveUnitPrice(
  productId: string,
  basePrice: number,
  promotions: Promotion[],
): number {
  let best = basePrice;

  for (const promo of promotions) {
    const applies =
      promo.productIds.length === 0 || promo.productIds.includes(productId);
    if (!applies || promo.discountPercent == null) continue;

    const discounted = basePrice * (1 - promo.discountPercent / 100);
    best = Math.min(best, discounted);
  }

  return Math.round(best * 100) / 100;
}

export function buildGuestLine(
  product: Product,
  quantity: number,
  promotions: Promotion[],
) {
  const unitPrice = getEffectiveUnitPrice(product.id, product.price, promotions);
  return {
    id: `guest-${product.id}`,
    productId: product.id,
    quantity,
    unitPrice,
    product,
    lineTotal: Math.round(unitPrice * quantity * 100) / 100,
  };
}
