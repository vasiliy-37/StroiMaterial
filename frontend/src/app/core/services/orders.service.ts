import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartService } from './cart.service';
import {
  addMockOrder,
  getMockOrder,
  getMockOrders,
  nextMockOrderNumber,
  updateMockOrderStatus,
} from '../mocks/orders.mock';

export type OrderItemView = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  nameEn: string;
  image: string;
};

export type OrderView = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  address?: string | null;
  phone?: string | null;
  comment?: string | null;
  createdAt: string;
  items: OrderItemView[];
};

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly cart = inject(CartService);
  private readonly api = environment.apiUrl;
  private readonly useMocks = environment.useMocks;

  getMyOrders() {
    if (this.useMocks) {
      return of(getMockOrders()).pipe(delay(100));
    }

    return this.http.get<OrderView[]>(`${this.api}/orders`);
  }

  getOrder(id: string) {
    if (this.useMocks) {
      const order = getMockOrder(id);
      return of(order ?? null).pipe(delay(100));
    }

    return this.http.get<OrderView>(`${this.api}/orders/${id}`);
  }

  createFromCart(data: { address?: string; phone?: string; comment?: string }) {
    if (this.useMocks) {
      const cart = this.cart.cart();
      const order: OrderView = {
        id: `order-${Date.now()}`,
        orderNumber: nextMockOrderNumber(),
        status: 'PENDING',
        total: cart.total,
        address: data.address ?? null,
        phone: data.phone ?? null,
        comment: data.comment ?? null,
        createdAt: new Date().toISOString(),
        items: cart.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.unitPrice,
          name: item.product.name,
          nameEn: item.product.nameEn,
          image: item.product.image,
        })),
      };
      addMockOrder(order);
      this.cart.clear().subscribe();
      return of(order).pipe(delay(250));
    }

    return this.http.post<OrderView>(`${this.api}/orders`, data);
  }

  getAdminOrders() {
    if (this.useMocks) {
      return of(getMockOrders()).pipe(delay(100));
    }

    return this.http.get<OrderView[]>(`${this.api}/admin/orders`);
  }

  updateOrderStatus(id: string, status: string) {
    if (this.useMocks) {
      const updated = updateMockOrderStatus(id, status);
      return of(updated!).pipe(delay(100));
    }

    return this.http.patch<OrderView>(`${this.api}/admin/orders/${id}/status`, { status });
  }
}
