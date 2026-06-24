import { ChangeDetectorRef, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth.service';
import { OrdersService, OrderView } from '../../core/services/orders.service';
import { orderStatusLabel } from '../../core/utils/order-status';
import { formatMoney, formatOrderDate } from '../../core/utils/format';

@Component({
  selector: 'app-profile-home',
  imports: [RouterLink],
  templateUrl: './profile-home.component.html',
  styleUrl: './profile-home.component.scss',
})
export class ProfileHomeComponent implements OnInit {
  readonly i18n = inject(LanguageService);
  readonly auth = inject(AuthService);
  private readonly ordersApi = inject(OrdersService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly latestOrder = signal<OrderView | null>(null);
  readonly loadingOrders = signal(true);

  readonly displayName = computed(() => this.auth.user()?.name || this.auth.user()?.email || '—');
  readonly initials = computed(() => {
    const name = this.displayName();
    return name === '—' ? '?' : name.slice(0, 1).toUpperCase();
  });

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.loadingOrders.set(false);
      return;
    }

    this.ordersApi
      .getMyOrders()
      .pipe(
        catchError(() => of([] as OrderView[])),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((orders) => {
        this.latestOrder.set(orders[0] ?? null);
        this.loadingOrders.set(false);
        this.cdr.detectChanges();
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
}
