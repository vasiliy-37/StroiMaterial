import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';
import { OrdersService, OrderView } from '../../core/services/orders.service';
import { orderStatusLabel } from '../../core/utils/order-status';
import { formatMoney, formatOrderDate } from '../../core/utils/format';

import { ProductImageComponent } from '../../shared/product-image/product-image.component';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, ProductImageComponent],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
})
export class OrderDetailComponent implements OnInit {
  readonly i18n = inject(LanguageService);
  private readonly route = inject(ActivatedRoute);
  private readonly ordersApi = inject(OrdersService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly order = signal<OrderView | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        filter((id): id is string => !!id),
        switchMap((id) => {
          this.loading.set(true);
          this.order.set(null);
          this.cdr.detectChanges();
          return this.ordersApi.getOrder(id).pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((order) => {
        this.order.set(order);
        this.loading.set(false);
        this.cdr.detectChanges();
      });
  }

  t(key: string): string {
    return this.i18n.t(key);
  }

  statusLabel(status: string): string {
    return orderStatusLabel(status, this.i18n.lang());
  }

  itemName(item: { name: string; nameEn: string }): string {
    return this.i18n.lang() === 'en' ? item.nameEn || item.name : item.name;
  }

  formatDate(value: string): string {
    return formatOrderDate(value, this.i18n.lang());
  }

  formatPrice(value: number): string {
    return formatMoney(value, this.i18n.lang());
  }

  lineTotal(price: number, quantity: number): string {
    return this.formatPrice(price * quantity);
  }
}
