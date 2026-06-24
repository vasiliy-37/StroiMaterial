import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService, OrderView } from '../../core/services/orders.service';
import { ToastService } from '../../core/services/toast.service';
import { orderStatusLabel } from '../../core/utils/order-status';
import { formatMoney, formatOrderDate } from '../../core/utils/format';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

@Component({
  selector: 'app-orders-admin',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './orders-admin.component.html',
  styleUrl: './orders-admin.component.scss',
})
export class OrdersAdminComponent implements OnInit {
  private readonly ordersApi = inject(OrdersService);
  private readonly toast = inject(ToastService);

  readonly orders = signal<OrderView[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly updatingId = signal<string | null>(null);
  readonly statuses = ORDER_STATUSES;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.ordersApi.getAdminOrders().subscribe({
      next: (list) => {
        this.orders.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Не удалось загрузить заказы');
      },
    });
  }

  statusLabel(status: string): string {
    return orderStatusLabel(status, 'ru');
  }

  formatDate(value: string): string {
    return formatOrderDate(value, 'ru');
  }

  formatPrice(value: number): string {
    return formatMoney(value, 'ru');
  }

  updateStatus(order: OrderView, status: string): void {
    if (status === order.status) return;
    this.updatingId.set(order.id);
    this.ordersApi.updateOrderStatus(order.id, status).subscribe({
      next: (updated) => {
        this.orders.update((list) => list.map((o) => (o.id === updated.id ? updated : o)));
        this.updatingId.set(null);
        this.toast.success(`Статус ${order.orderNumber} обновлён`);
      },
      error: () => {
        this.updatingId.set(null);
        this.toast.error('Не удалось обновить статус');
      },
    });
  }
}
