const STATUS_RU: Record<string, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждён',
  PROCESSING: 'Обработка',
  SHIPPED: 'В пути',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
};

const STATUS_EN: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export function orderStatusLabel(status: string, lang: 'ru' | 'en' = 'ru'): string {
  const map = lang === 'en' ? STATUS_EN : STATUS_RU;
  return map[status] ?? status;
}
