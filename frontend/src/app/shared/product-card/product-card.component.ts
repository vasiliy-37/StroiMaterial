import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguageService } from '../../core/services/language.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/catalog.models';
import { ProductImageComponent } from '../product-image/product-image.component';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe, ProductImageComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly i18n = inject(LanguageService);
  readonly cart = inject(CartService);
  readonly favorites = inject(FavoritesService);
  private readonly toast = inject(ToastService);

  readonly adding = signal(false);
  readonly favPop = signal(false);

  name(): string {
    const p = this.product();
    return this.i18n.lang() === 'en' ? p.nameEn : p.name;
  }

  stockLabel(): string {
    const p = this.product();
    return this.i18n.lang() === 'en' ? p.stockLabelEn : p.stockLabel;
  }

  isFavorite(): boolean {
    return this.favorites.isFavorite(this.product().id);
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const result = this.favorites.toggle(this.product().id);
    this.favPop.set(true);
    window.setTimeout(() => this.favPop.set(false), 320);
    this.toast.success(
      this.t(result === 'added' ? 'toast.addedToFavorites' : 'toast.removedFromFavorites'),
    );
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const p = this.product();
    if (this.adding()) return;
    this.adding.set(true);
    this.cart.addItem(p.id, 1).subscribe({
      next: () => {
        this.adding.set(false);
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

  t(key: string): string {
    return this.i18n.t(key);
  }
}
