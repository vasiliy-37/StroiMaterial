export interface Product {
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
}

export interface SiteService {
  id: string;
  icon: string;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
  active: boolean;
}

export type PromotionType = 'sale' | 'promo' | 'clearance';

export interface Promotion {
  id: string;
  titleRu: string;
  titleEn: string;
  descriptionRu: string;
  descriptionEn: string;
  discountPercent?: number;
  type: PromotionType;
  startDate: string;
  endDate: string;
  active: boolean;
  productIds: string[];
}

export interface CatalogState {
  products: Product[];
  services: SiteService[];
  promotions: Promotion[];
  contentRu: Record<string, string>;
  contentEn: Record<string, string>;
  heroImage: string;
}
