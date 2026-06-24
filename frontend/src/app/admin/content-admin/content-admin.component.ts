import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogStoreService } from '../../core/services/catalog-store.service';
import { ToastService } from '../../core/services/toast.service';
import { TRANSLATIONS } from '../../core/i18n/translations';

const EDITABLE_KEYS = [
  { key: 'home.heroTitle', label: 'Главная — заголовок баннера' },
  { key: 'home.heroText', label: 'Главная — текст баннера' },
  { key: 'home.friendlyPrices', label: 'Блок «Дружеские цены»' },
  { key: 'home.servicesGrid', label: 'Блок «Сервисы и расчёты»' },
  { key: 'footer.tagline', label: 'Футер — слоган' },
  { key: 'footer.newsletterHint', label: 'Футер — подписка' },
  { key: 'header.phone', label: 'Телефон в шапке' },
  { key: 'nav.sale', label: 'Пункт меню «Распродажа»' },
  { key: 'nav.promo', label: 'Пункт меню «Акции»' },
];

@Component({
  selector: 'app-content-admin',
  imports: [FormsModule],
  templateUrl: './content-admin.component.html',
  styleUrl: './content-admin.component.scss',
})
export class ContentAdminComponent {
  readonly store = inject(CatalogStoreService);
  private readonly toast = inject(ToastService);
  readonly keys = EDITABLE_KEYS;
  readonly selectedKey = signal(EDITABLE_KEYS[0].key);
  readonly ruText = signal('');
  readonly enText = signal('');
  readonly heroUrl = signal('');

  constructor() {
    this.selectKey(EDITABLE_KEYS[0].key);
    this.heroUrl.set(this.store.heroImage());
  }

  selectKey(key: string): void {
    this.selectedKey.set(key);
    const ru = this.store.getContentOverrides('ru')[key] ?? TRANSLATIONS.ru[key] ?? '';
    const en = this.store.getContentOverrides('en')[key] ?? TRANSLATIONS.en[key] ?? '';
    this.ruText.set(ru);
    this.enText.set(en);
  }

  save(): void {
    this.store.updateContent(this.selectedKey(), this.ruText(), this.enText()).subscribe({
      next: () => this.toast.success('Текст сохранён'),
      error: () => this.toast.error('Ошибка сохранения'),
    });
  }

  saveHero(): void {
    this.store.setHeroImage(this.heroUrl()).subscribe({
      next: () => this.toast.success('Фото баннера обновлено'),
      error: () => this.toast.error('Ошибка сохранения'),
    });
  }
}
