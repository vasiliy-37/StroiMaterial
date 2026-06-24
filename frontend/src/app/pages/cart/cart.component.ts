import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguageService } from '../../core/services/language.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductImageComponent } from '../../shared/product-image/product-image.component';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CurrencyPipe, ProductImageComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  readonly i18n = inject(LanguageService);
  readonly cartService = inject(CartService);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly items = computed(() => this.cartService.cart().items);
  readonly total = computed(() => this.cartService.cart().total);

  t(key: string): string {
    return this.i18n.t(key);
  }

  itemName(item: { product: { name: string; nameEn: string } }): string {
    return this.i18n.lang() === 'en' ? item.product.nameEn : item.product.name;
  }

  changeQty(itemId: string, qty: number): void {
    if (qty < 1) return;
    this.cartService.updateItem(itemId, qty).subscribe({
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.message;
        this.toast.error(
          Array.isArray(msg) ? msg[0] : msg ? String(msg) : this.t('toast.error'),
        );
      },
    });
  }

  remove(itemId: string): void {
    this.cartService.removeItem(itemId).subscribe({
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.message;
        this.toast.error(
          Array.isArray(msg) ? msg[0] : msg ? String(msg) : this.t('toast.error'),
        );
      },
    });
  }

  hasDiscount(item: { unitPrice: number; product: { price: number } }): boolean {
    return item.unitPrice < item.product.price;
  }
}
