import { Injectable, inject, signal, computed } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Lang, LANGUAGES, TRANSLATIONS } from '../i18n/translations';
import { CatalogStoreService } from './catalog-store.service';

const STORAGE_KEY = 'buildpro-lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly catalog = inject(CatalogStoreService);
  private readonly document = inject(DOCUMENT);

  readonly languages = LANGUAGES;

  private readonly langSignal = signal<Lang>(this.readStored());

  readonly lang = this.langSignal.asReadonly();

  readonly currentLanguage = computed(
    () => this.languages.find((l) => l.code === this.lang()) ?? this.languages[0],
  );

  constructor() {
    this.applyDocumentLang(this.langSignal());
  }

  setLang(code: Lang): void {
    this.langSignal.set(code);
    localStorage.setItem(STORAGE_KEY, code);
    this.applyDocumentLang(code);
  }

  toggleDropdown = signal(false);

  t(key: string): string {
    const overrides = this.catalog.getContentOverrides(this.lang());
    if (overrides[key]) {
      return overrides[key];
    }
    const dict = TRANSLATIONS[this.lang()];
    return dict[key] ?? TRANSLATIONS.en[key] ?? key;
  }

  private applyDocumentLang(code: Lang): void {
    this.document.documentElement.lang = code === 'en' ? 'en' : 'ru';
  }

  private readStored(): Lang {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'ru' ? 'ru' : 'en';
  }
}
