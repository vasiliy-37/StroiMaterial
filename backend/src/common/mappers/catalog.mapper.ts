import { Product, Promotion, SiteService, Order, OrderItem } from '@prisma/client';

export type ProductDto = {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: 'sale' | 'pro';
  stock: number;
  stockQty: number;
  stockLabel: string;
  stockLabelEn: string;
  brand: string;
  category: string;
  active: boolean;
};

export type PromotionDto = {
  id: string;
  titleRu: string;
  titleEn: string;
  descriptionRu: string;
  descriptionEn: string;
  discountPercent?: number;
  type: 'sale' | 'promo' | 'clearance';
  startDate: string;
  endDate: string;
  active: boolean;
  productIds: string[];
};

export type SiteServiceDto = {
  id: string;
  icon: string;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
  active: boolean;
};

export type CatalogStateDto = {
  products: ProductDto[];
  services: SiteServiceDto[];
  promotions: PromotionDto[];
  contentRu: Record<string, string>;
  contentEn: Record<string, string>;
  heroImage: string;
};

export function toProductDto(product: Product): ProductDto {
  return {
    id: product.id,
    name: product.name,
    nameEn: product.nameEn,
    price: Number(product.price),
    oldPrice: product.oldPrice != null ? Number(product.oldPrice) : undefined,
    image: product.image,
    badge: product.badge ?? undefined,
    stock: product.stock,
    stockQty: product.stockQty,
    stockLabel: product.stockLabel,
    stockLabelEn: product.stockLabelEn,
    brand: product.brand,
    category: product.category,
    active: product.active,
  };
}

export function toPromotionDto(
  promotion: Promotion & { products?: { productId: string }[] },
): PromotionDto {
  return {
    id: promotion.id,
    titleRu: promotion.titleRu,
    titleEn: promotion.titleEn,
    descriptionRu: promotion.descriptionRu,
    descriptionEn: promotion.descriptionEn,
    discountPercent: promotion.discountPercent ?? undefined,
    type: promotion.type,
    startDate: formatDate(promotion.startDate),
    endDate: formatDate(promotion.endDate),
    active: promotion.active,
    productIds: promotion.products?.map((p) => p.productId) ?? [],
  };
}

export function toSiteServiceDto(service: SiteService): SiteServiceDto {
  return {
    id: service.id,
    icon: service.icon,
    titleRu: service.titleRu,
    titleEn: service.titleEn,
    descRu: service.descRu,
    descEn: service.descEn,
    active: service.active,
  };
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export type OrderItemDto = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  nameEn: string;
  image: string;
};

export type OrderDto = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  address?: string | null;
  phone?: string | null;
  comment?: string | null;
  createdAt: string;
  items: OrderItemDto[];
};

export function toOrderDto(
  order: Order & { items: OrderItem[] },
): OrderDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: Number(order.total),
    address: order.address,
    phone: order.phone,
    comment: order.comment,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.price),
      name: item.name,
      nameEn: item.nameEn,
      image: item.image,
    })),
  };
}
