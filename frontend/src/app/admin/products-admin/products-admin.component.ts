import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogStoreService } from '../../core/services/catalog-store.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { Product } from '../../core/models/catalog.models';
import { ProductImageComponent } from '../../shared/product-image/product-image.component';

const EMPTY: Product = {
  id: '',
  name: '',
  nameEn: '',
  price: 0,
  image: '',
  stock: 100,
  stockQty: 100,
  stockLabel: 'В наличии',
  stockLabelEn: 'In stock',
  brand: '',
  category: 'tools',
  active: true,
};

@Component({
  selector: 'app-products-admin',
  imports: [FormsModule, CurrencyPipe, RouterLink, ProductImageComponent],
  templateUrl: './products-admin.component.html',
  styleUrl: './products-admin.component.scss',
})
export class ProductsAdminComponent {
  readonly store = inject(CatalogStoreService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  readonly editing = signal<Product | null>(null);
  readonly form = signal<Product>({ ...EMPTY });
  readonly showForm = signal(false);

  readonly categories = ['tools', 'electric', 'plumbing', 'materials', 'garden', 'paint'];

  startAdd(): void {
    this.editing.set(null);
    this.form.set({ ...EMPTY, id: this.store.newId('prod') });
    this.showForm.set(true);
  }

  startEdit(product: Product): void {
    this.editing.set(product);
    this.form.set({ ...product });
    this.showForm.set(true);
  }

  save(): void {
    const data = this.form();
    if (!data.name.trim() || !data.price) return;
    this.store.saveProduct({ ...data }).subscribe({
      next: () => {
        this.showForm.set(false);
        this.editing.set(null);
        this.toast.success('Товар сохранён');
      },
      error: () => this.toast.error('Ошибка сохранения'),
    });
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirm.confirm('Удалить товар?');
    if (!ok) return;
    this.store.deleteProduct(id).subscribe({
      next: () => this.toast.success('Товар удалён'),
      error: () => this.toast.error('Ошибка удаления'),
    });
    if (this.editing()?.id === id) this.showForm.set(false);
  }

  cancel(): void {
    this.editing.set(null);
    this.showForm.set(false);
    this.form.set({ ...EMPTY });
  }

  patch(field: keyof Product, value: string | number | boolean | undefined): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }
}
