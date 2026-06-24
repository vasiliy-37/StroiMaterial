import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogStoreService } from '../../core/services/catalog-store.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { Promotion, PromotionType } from '../../core/models/catalog.models';

const EMPTY: Promotion = {
  id: '',
  titleRu: '',
  titleEn: '',
  descriptionRu: '',
  descriptionEn: '',
  type: 'promo',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '2026-12-31',
  active: true,
  productIds: [],
  discountPercent: 10,
};

@Component({
  selector: 'app-promotions-admin',
  imports: [FormsModule],
  templateUrl: './promotions-admin.component.html',
  styleUrl: './promotions-admin.component.scss',
})
export class PromotionsAdminComponent {
  readonly store = inject(CatalogStoreService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  readonly editing = signal<Promotion | null>(null);
  readonly form = signal<Promotion>({ ...EMPTY });
  readonly showForm = signal(false);

  readonly types: { value: PromotionType; label: string }[] = [
    { value: 'promo', label: 'Акция' },
    { value: 'sale', label: 'Скидка' },
    { value: 'clearance', label: 'Распродажа' },
  ];

  startAdd(): void {
    this.editing.set(null);
    this.form.set({ ...EMPTY, id: this.store.newId('promo') });
    this.showForm.set(true);
  }

  startEdit(p: Promotion): void {
    this.editing.set(p);
    this.form.set({ ...p });
    this.showForm.set(true);
  }

  save(): void {
    const data = this.form();
    if (!data.titleRu.trim()) return;
    this.store.savePromotion({ ...data }).subscribe({
      next: () => {
        this.showForm.set(false);
        this.toast.success('Акция сохранена');
      },
      error: () => this.toast.error('Ошибка сохранения'),
    });
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirm.confirm('Удалить акцию?');
    if (!ok) return;
    this.store.deletePromotion(id).subscribe({
      next: () => this.toast.success('Акция удалена'),
      error: () => this.toast.error('Ошибка удаления'),
    });
  }

  patch(field: keyof Promotion, value: string | number | boolean | string[]): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  toggleProduct(id: string): void {
    const ids = [...this.form().productIds];
    const idx = ids.indexOf(id);
    if (idx >= 0) ids.splice(idx, 1);
    else ids.push(id);
    this.patch('productIds', ids);
  }

  isProductSelected(id: string): boolean {
    return this.form().productIds.includes(id);
  }
}
