import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';
import { CatalogStoreService } from '../../core/services/catalog-store.service';
import { Product } from '../../core/models/catalog.models';
import { Lang } from '../../core/i18n/translations';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/product-card-skeleton/product-card-skeleton.component';
import { AuthService } from '../../core/services/auth.service';

const CATEGORY_TITLE_KEYS: Record<string, string> = {
  materials: 'nav.materials',
  tools: 'nav.tools',
  electric: 'nav.electric',
  plumbing: 'nav.plumbing',
  garden: 'nav.garden',
  paint: 'nav.paint',
};

const CATEGORY_OPTIONS = Object.keys(CATEGORY_TITLE_KEYS).map((slug) => ({
  slug,
  labelKey: CATEGORY_TITLE_KEYS[slug],
}));

type CatalogSort = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'discount';

const SORT_OPTIONS: { value: CatalogSort; labelKey: string }[] = [
  { value: 'default', labelKey: 'catalog.sortDefault' },
  { value: 'price-asc', labelKey: 'catalog.sortPriceAsc' },
  { value: 'price-desc', labelKey: 'catalog.sortPriceDesc' },
  { value: 'name-asc', labelKey: 'catalog.sortNameAsc' },
  { value: 'name-desc', labelKey: 'catalog.sortNameDesc' },
  { value: 'discount', labelKey: 'catalog.sortDiscount' },
];

const VALID_SORTS = new Set<CatalogSort>(SORT_OPTIONS.map((o) => o.value));

function parseSort(value: string | null): CatalogSort {
  return value && VALID_SORTS.has(value as CatalogSort) ? (value as CatalogSort) : 'default';
}

function parseList(value: string | null): string[] {
  if (!value) {
    return [];
  }
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function parsePrice(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : null;
}

function joinList(values: string[]): string | null {
  return values.length ? values.join(',') : null;
}

function productName(product: Product, lang: Lang): string {
  return lang === 'en' ? product.nameEn || product.name : product.name;
}

function discountPercent(product: Product): number {
  if (product.oldPrice == null || product.oldPrice <= product.price) {
    return 0;
  }
  return ((product.oldPrice - product.price) / product.oldPrice) * 100;
}

function sortProducts(products: Product[], sort: CatalogSort, lang: Lang): Product[] {
  const list = [...products];
  const locale = lang === 'en' ? 'en' : 'ru';

  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return list.sort((a, b) => productName(a, lang).localeCompare(productName(b, lang), locale));
    case 'name-desc':
      return list.sort((a, b) => productName(b, lang).localeCompare(productName(a, lang), locale));
    case 'discount':
      return list.sort((a, b) => discountPercent(b) - discountPercent(a));
    default:
      return list;
  }
}

@Component({
  selector: 'app-catalog',
  imports: [RouterLink, ProductCardComponent, ProductCardSkeletonComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent {
  readonly i18n = inject(LanguageService);
  readonly store = inject(CatalogStoreService);
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly sortOptions = SORT_OPTIONS;
  readonly categoryOptions = CATEGORY_OPTIONS;
  readonly filtersOpen = signal(false);

  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly selectedCategories = computed(() => parseList(this.queryParams().get('category')));
  readonly selectedBrands = computed(() => parseList(this.queryParams().get('brand')));
  readonly priceMin = computed(() => parsePrice(this.queryParams().get('priceMin')));
  readonly priceMax = computed(() => parsePrice(this.queryParams().get('priceMax')));
  readonly inStockOnly = computed(() => this.queryParams().get('inStock') === '1');
  readonly saleOnly = computed(() => this.queryParams().get('sale') === '1');
  readonly promoOnly = computed(() => this.queryParams().get('promo') === '1');
  readonly sortBy = computed(() => parseSort(this.queryParams().get('sort')));

  readonly baseProducts = computed(() => {
    let products = this.store.products();
    const categories = this.selectedCategories();
    if (categories.length) {
      products = products.filter((p) => categories.includes(p.category));
    }
    if (this.saleOnly()) {
      products = products.filter((p) => p.oldPrice != null && p.oldPrice > p.price);
    }
    if (this.promoOnly()) {
      products = products.filter((p) => !!p.badge);
    }
    return products;
  });

  readonly brandFacets = computed(() => {
    const counts = new Map<string, number>();
    for (const product of this.baseProducts()) {
      counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b, this.i18n.lang() === 'en' ? 'en' : 'ru'))
      .map(([brand, count]) => ({ brand, count }));
  });

  readonly priceBounds = computed(() => {
    const prices = this.baseProducts().map((p) => p.price);
    if (!prices.length) {
      return { min: 0, max: 0 };
    }
    return { min: Math.min(...prices), max: Math.max(...prices) };
  });

  readonly filteredProducts = computed(() => {
    let products = this.baseProducts();
    const brands = this.selectedBrands();
    const min = this.priceMin();
    const max = this.priceMax();

    if (brands.length) {
      products = products.filter((p) => brands.includes(p.brand));
    }
    if (min != null) {
      products = products.filter((p) => p.price >= min);
    }
    if (max != null) {
      products = products.filter((p) => p.price <= max);
    }
    if (this.inStockOnly()) {
      products = products.filter((p) => p.stock > 0);
    }
    return products;
  });

  readonly sortedProducts = computed(() =>
    sortProducts(this.filteredProducts(), this.sortBy(), this.i18n.lang()),
  );

  readonly hasActiveFilters = computed(
    () =>
      this.selectedBrands().length > 0 ||
      this.priceMin() != null ||
      this.priceMax() != null ||
      this.inStockOnly(),
  );

  readonly pageTitle = computed(() => {
    const categories = this.selectedCategories();
    if (categories.length === 1 && CATEGORY_TITLE_KEYS[categories[0]]) {
      return this.t(CATEGORY_TITLE_KEYS[categories[0]]);
    }
    if (this.saleOnly()) {
      return this.t('nav.sale');
    }
    if (this.promoOnly()) {
      return this.t('nav.promo');
    }
    return this.t('catalog.title');
  });

  setSort(sort: string): void {
    const value = parseSort(sort);
    this.updateQuery({ sort: value === 'default' ? null : value });
  }

  toggleCategory(slug: string): void {
    const current = this.selectedCategories();
    const next = current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [...current, slug];
    this.updateQuery({ category: joinList(next) });
  }

  toggleBrand(brand: string): void {
    const current = this.selectedBrands();
    const next = current.includes(brand)
      ? current.filter((item) => item !== brand)
      : [...current, brand];
    this.updateQuery({ brand: joinList(next) });
  }

  setPriceMin(value: string): void {
    const parsed = value.trim() === '' ? null : parsePrice(value);
    this.updateQuery({ priceMin: parsed == null ? null : String(parsed) });
  }

  setPriceMax(value: string): void {
    const parsed = value.trim() === '' ? null : parsePrice(value);
    this.updateQuery({ priceMax: parsed == null ? null : String(parsed) });
  }

  setPriceMaxFromSlider(value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return;
    }
    this.updateQuery({ priceMax: String(parsed) });
  }

  toggleInStock(): void {
    this.updateQuery({ inStock: this.inStockOnly() ? null : '1' });
  }

  toggleSale(): void {
    this.updateQuery({ sale: this.saleOnly() ? null : '1' });
  }

  resetSidebarFilters(): void {
    this.updateQuery({
      brand: null,
      priceMin: null,
      priceMax: null,
      inStock: null,
    });
  }

  openFilters(): void {
    this.filtersOpen.set(true);
  }

  closeFilters(): void {
    this.filtersOpen.set(false);
  }

  applyFilters(): void {
    this.closeFilters();
  }

  t(key: string): string {
    return this.i18n.t(key);
  }

  private updateQuery(params: Record<string, string | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }
}
