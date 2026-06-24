import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogStoreService } from '../../core/services/catalog-store.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { SiteService } from '../../core/models/catalog.models';

const EMPTY: SiteService = {
  id: '',
  icon: 'handyman',
  titleRu: '',
  titleEn: '',
  descRu: '',
  descEn: '',
  active: true,
};

@Component({
  selector: 'app-services-admin',
  imports: [FormsModule],
  templateUrl: './services-admin.component.html',
  styleUrl: './services-admin.component.scss',
})
export class ServicesAdminComponent {
  readonly store = inject(CatalogStoreService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  readonly editing = signal<SiteService | null>(null);
  readonly form = signal<SiteService>({ ...EMPTY });
  readonly showForm = signal(false);

  readonly icons = ['door_front', 'calculate', 'palette', 'local_shipping', 'handyman', 'engineering', 'build'];

  startAdd(): void {
    this.editing.set(null);
    this.form.set({ ...EMPTY, id: this.store.newId('svc') });
    this.showForm.set(true);
  }

  startEdit(s: SiteService): void {
    this.editing.set(s);
    this.form.set({ ...s });
    this.showForm.set(true);
  }

  save(): void {
    const data = this.form();
    if (!data.titleRu.trim()) return;
    this.store.saveService({ ...data }).subscribe({
      next: () => {
        this.showForm.set(false);
        this.toast.success('Услуга сохранена');
      },
      error: () => this.toast.error('Ошибка сохранения'),
    });
  }

  async remove(id: string): Promise<void> {
    const ok = await this.confirm.confirm('Удалить услугу?');
    if (!ok) return;
    this.store.deleteService(id).subscribe({
      next: () => this.toast.success('Услуга удалена'),
      error: () => this.toast.error('Ошибка удаления'),
    });
  }

  patch(field: keyof SiteService, value: string | boolean): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }
}
