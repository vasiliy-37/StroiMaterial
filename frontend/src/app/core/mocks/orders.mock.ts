import { OrderView } from '../services/orders.service';

const ORDERS_KEY = 'buildpro-mock-orders';
let orderSeq = 1000;

function readOrders(): OrderView[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as OrderView[]) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: OrderView[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function getMockOrders(): OrderView[] {
  return readOrders().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getMockOrder(id: string): OrderView | undefined {
  return readOrders().find((o) => o.id === id || o.orderNumber === id);
}

export function addMockOrder(order: OrderView): OrderView {
  const orders = readOrders();
  orders.unshift(order);
  writeOrders(orders);
  return order;
}

export function updateMockOrderStatus(id: string, status: string): OrderView | undefined {
  const orders = readOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index < 0) return undefined;
  orders[index] = { ...orders[index], status };
  writeOrders(orders);
  return orders[index];
}

export function nextMockOrderNumber(): string {
  orderSeq += 1;
  return `BP-${orderSeq}`;
}
