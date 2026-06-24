import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  private readonly api = environment.apiUrl;

  getMyOrders() {
    return this.http.get<OrderView[]>(`${this.api}/orders`);
  }

  getOrder(id: string) {
    return this.http.get<OrderView>(`${this.api}/orders/${id}`);
  }

  createFromCart(data: { address?: string; phone?: string; comment?: string }) {
    return this.http.post<OrderView>(`${this.api}/orders`, data);
  }

  getAdminOrders() {
    return this.http.get<OrderView[]>(`${this.api}/admin/orders`);
  }

  updateOrderStatus(id: string, status: string) {
    return this.http.patch<OrderView>(`${this.api}/admin/orders/${id}/status`, { status });
  }
}
