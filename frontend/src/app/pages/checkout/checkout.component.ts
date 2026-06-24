import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, FormsModule, CurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  readonly i18n = inject(LanguageService);
  readonly cartService = inject(CartService);
  readonly orders = inject(OrdersService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly total = computed(() => this.cartService.cart().total);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly fieldErrors = signal<{ phone?: boolean; address?: boolean }>({});

  delivery = 'courier';
  payment = 'card';
  city = '';
  address = '';
  phone = '';
  comment = '';

  ngOnInit(): void {
    if (this.cartService.cart().items.length === 0) {
      this.router.navigate(['/cart']);
    }
    const user = this.auth.user();
    if (user?.phone && !this.phone) {
      this.phone = user.phone;
    }
  }

  t(key: string): string {
    return this.i18n.t(key);
  }

  private buildOrderComment(): string | undefined {
    const deliveryLabel =
      this.delivery === 'pickup'
        ? this.i18n.lang() === 'en'
          ? 'Pickup'
          : 'Самовывоз'
        : this.i18n.lang() === 'en'
          ? 'Courier'
          : 'Курьером';
    const paymentLabel =
      this.payment === 'cash'
        ? this.i18n.lang() === 'en'
          ? 'Cash on delivery'
          : 'Наличными при получении'
        : this.i18n.lang() === 'en'
          ? 'Bank card'
          : 'Банковская карта';

    const parts = [
      `${this.i18n.lang() === 'en' ? 'Delivery' : 'Доставка'}: ${deliveryLabel}`,
      `${this.i18n.lang() === 'en' ? 'Payment' : 'Оплата'}: ${paymentLabel}`,
    ];

    if (this.comment.trim()) {
      parts.push(this.comment.trim());
    }

    return parts.join('\n');
  }

  submit(): void {
    this.submitError.set(null);
    const errors: { phone?: boolean; address?: boolean } = {};
    if (!this.phone.trim()) errors.phone = true;
    if (!this.address.trim()) errors.address = true;
    this.fieldErrors.set(errors);
    if (errors.phone || errors.address) {
      return;
    }
    if (this.cartService.cart().items.length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    this.submitting.set(true);
    this.orders
      .createFromCart({
        address: [this.city, this.address].filter(Boolean).join(', ') || undefined,
        phone: this.phone || undefined,
        comment: this.buildOrderComment(),
      })
      .subscribe({
        next: (order) => {
          this.cartService.refresh().subscribe();
          this.router.navigate(['/order-success'], {
            queryParams: { order: order.orderNumber },
          });
        },
        error: () => {
          this.submitting.set(false);
          this.submitError.set(this.t('checkout.error'));
        },
      });
  }
}
