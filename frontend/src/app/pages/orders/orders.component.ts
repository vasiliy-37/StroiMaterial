import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { OrdersService, OrderView } from '../../core/services/orders.service';
import { orderStatusLabel } from '../../core/utils/order-status';
import { formatMoney, formatOrderDate } from '../../core/utils/format';

@Component({
  selector: 'app-orders',
  imports: [RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit {
  readonly i18n = inject(LanguageService);
  private readonly ordersApi = inject(OrdersService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly orders = signal<OrderView[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.ordersApi
      .getMyOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.orders.set(list);
          this.loading.set(false);
          this.cdr.detectChanges();
        },
        error: () => {
          this.error.set(this.t('orders.loadError'));
          this.loading.set(false);
          this.cdr.detectChanges();
        },
      });
  }

  t(key: string): string {
    return this.i18n.t(key);
  }

  statusLabel(status: string): string {
    return orderStatusLabel(status, this.i18n.lang());
  }

  formatDate(value: string): string {
    return formatOrderDate(value, this.i18n.lang());
  }

  formatPrice(value: number): string {
    return formatMoney(value, this.i18n.lang());
  }

  retry(): void {
    this.loading.set(true);
    this.error.set(null);
    this.load();
  }

  itemCountLabel(count: number): string {
    if (this.i18n.lang() === 'en') {
      return count === 1 ? '1 item' : `${count} items`;
    }
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) {
      return `${count} товар`;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return `${count} товара`;
    }
    return `${count} товаров`;
  }
}
