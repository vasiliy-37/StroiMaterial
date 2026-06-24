import { Component, inject, input, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguageService } from '../../core/services/language.service';
import { CatalogStoreService } from '../../core/services/catalog-store.service';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ProductImageComponent } from '../../shared/product-image/product-image.component';
import { ProductCardSkeletonComponent } from '../../shared/product-card-skeleton/product-card-skeleton.component';

@Component({
  selector: 'app-product',
  imports: [RouterLink, CurrencyPipe, ProductCardComponent, ProductImageComponent, ProductCardSkeletonComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent {
  readonly id = input.required<string>();
  readonly i18n = inject(LanguageService);
  readonly store = inject(CatalogStoreService);
  readonly cart = inject(CartService);
  readonly favorites = inject(FavoritesService);
  private readonly toast = inject(ToastService);

  readonly adding = signal(false);
  readonly addSuccess = signal(false);

  readonly product = computed(() => this.store.getProductById(this.id()));
  readonly notFound = computed(() => !this.store.loading() && !this.product());
  readonly related = computed(() => {
    const current = this.product();
    if (!current) return [];
    return this.store.products().filter((p) => p.id !== this.id() && p.category === current.category).slice(0, 4);
  });

  t(key: string): string {
    return this.i18n.t(key);
  }

  name(): string {
    const p = this.product();
    if (!p) return '';
    return this.i18n.lang() === 'en' ? p.nameEn : p.name;
  }

  stockLabel(): string {
    const p = this.product();
    if (!p) return '';
    return this.i18n.lang() === 'en' ? p.stockLabelEn : p.stockLabel;
  }

  isFavorite(): boolean {
    return this.favorites.isFavorite(this.id());
  }

  toggleFavorite(): void {
    const result = this.favorites.toggle(this.id());
    this.toast.success(
      this.t(result === 'added' ? 'toast.addedToFavorites' : 'toast.removedFromFavorites'),
    );
  }

  addToCart(): void {
    const p = this.product();
    if (!p || this.adding()) return;
    this.adding.set(true);
    this.cart.addItem(p.id, 1).subscribe({
      next: () => {
        this.adding.set(false);
        this.addSuccess.set(true);
        window.setTimeout(() => this.addSuccess.set(false), 600);
        this.toast.success(this.t('toast.addedToCart'));
      },
      error: (err: HttpErrorResponse) => {
        this.adding.set(false);
        const msg = err.error?.message;
        this.toast.error(
          Array.isArray(msg) ? msg[0] : msg ? String(msg) : this.t('toast.error'),
        );
      },
    });
  }
}
