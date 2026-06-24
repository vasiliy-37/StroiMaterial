import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, forkJoin, map } from 'rxjs';
import { CatalogState, Product, Promotion, SiteService } from '../models/catalog.models';
import { Lang } from '../i18n/translations';
import { environment } from '../../../environments/environment';

const EMPTY_STATE: CatalogState = {
  products: [],
  services: [],
  promotions: [],
  contentRu: {},
  contentEn: {},
  heroImage: '',
};

@Injectable({ providedIn: 'root' })
export class CatalogStoreService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  private readonly state = signal<CatalogState>(EMPTY_STATE);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly products = computed(() => this.state().products.filter((p) => p.active));
  readonly allProducts = computed(() => this.state().products);
  readonly services = computed(() => this.state().services.filter((s) => s.active));
  readonly allServices = computed(() => this.state().services);
  readonly promotions = computed(() => this.state().promotions);
  readonly allPromotions = computed(() => this.state().promotions);
  readonly heroImage = computed(() => this.state().heroImage);

  constructor() {
    this.refresh().subscribe();
  }

  getProductById(id: string): Product | undefined {
    return this.state().products.find((p) => p.id === id && p.active);
  }

  getContentOverrides(lang: Lang): Record<string, string> {
    return lang === 'en' ? this.state().contentEn : this.state().contentRu;
  }

  refresh(): Observable<CatalogState> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<CatalogState>(`${this.api}/catalog`).pipe(
      tap((data) => {
        this.state.set(data);
        this.loading.set(false);
      }),
      catchError(() => {
        this.state.set(EMPTY_STATE);
        this.error.set('Не удалось загрузить каталог. Проверьте, что API запущен.');
        this.loading.set(false);
        return of(EMPTY_STATE);
      }),
    );
  }

  loadAdminData(): Observable<void> {
    return forkJoin({
      products: this.http.get<Product[]>(`${this.api}/admin/products`),
      services: this.http.get<SiteService[]>(`${this.api}/admin/services`),
      promotions: this.http.get<Promotion[]>(`${this.api}/admin/promotions`),
      content: this.http.get<{ contentRu: Record<string, string>; contentEn: Record<string, string>; heroImage: string }>(
        `${this.api}/admin/content`,
      ),
    }).pipe(
      tap(({ products, services, promotions, content }) => {
        this.state.update((s) => ({
          ...s,
          products,
          services,
          promotions,
          contentRu: content.contentRu,
          contentEn: content.contentEn,
          heroImage: content.heroImage,
        }));
      }),
      map(() => undefined),
      catchError((err) => {
        this.error.set(err?.error?.message ?? 'Ошибка загрузки админ-данных');
        throw err;
      }),
    );
  }

  searchProducts(query: string): Observable<Product[]> {
    const options = query ? { params: { search: query } } : {};
    return this.http.get<Product[]>(`${this.api}/products`, options);
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/products/brands`);
  }

  saveProduct(product: Product): Observable<Product> {
    const exists = this.state().products.some((p) => p.id === product.id);
    const req = exists
      ? this.http.patch<Product>(`${this.api}/admin/products/${product.id}`, product)
      : this.http.post<Product>(`${this.api}/admin/products`, product);
    return req.pipe(tap(() => this.loadAdminData().subscribe()));
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/products/${id}`).pipe(
      tap(() => this.loadAdminData().subscribe()),
    );
  }

  saveService(service: SiteService): Observable<SiteService> {
    const exists = this.state().services.some((s) => s.id === service.id);
    const req = exists
      ? this.http.patch<SiteService>(`${this.api}/admin/services/${service.id}`, service)
      : this.http.post<SiteService>(`${this.api}/admin/services`, service);
    return req.pipe(tap(() => this.loadAdminData().subscribe()));
  }

  deleteService(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/services/${id}`).pipe(
      tap(() => this.loadAdminData().subscribe()),
    );
  }

  savePromotion(promotion: Promotion): Observable<Promotion> {
    const exists = this.state().promotions.some((p) => p.id === promotion.id);
    const req = exists
      ? this.http.patch<Promotion>(`${this.api}/admin/promotions/${promotion.id}`, promotion)
      : this.http.post<Promotion>(`${this.api}/admin/promotions`, promotion);
    return req.pipe(tap(() => this.loadAdminData().subscribe()));
  }

  deletePromotion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/promotions/${id}`).pipe(
      tap(() => this.loadAdminData().subscribe()),
    );
  }

  updateContent(key: string, ru: string, en: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/admin/content/entry`, { key, ru, en }).pipe(
      tap(() => this.loadAdminData().subscribe()),
    );
  }

  setHeroImage(url: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/admin/content/hero`, { heroImage: url }).pipe(
      tap(() => {
        this.state.update((s) => ({ ...s, heroImage: url }));
        this.loadAdminData().subscribe();
      }),
    );
  }

  newId(prefix: string): string {
    return `${prefix}-${Date.now()}`;
  }
}
