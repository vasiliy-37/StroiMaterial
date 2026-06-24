import { Injectable, signal, computed } from '@angular/core';
import { CatalogStoreService } from './catalog-store.service';
import { Product } from '../models/catalog.models';

const STORAGE_KEY = 'buildpro-favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly ids = signal<string[]>(this.read());

  readonly count = computed(() => this.ids().length);

  constructor(private readonly catalog: CatalogStoreService) {}

  products(): Product[] {
    const set = new Set(this.ids());
    return this.catalog.products().filter((p) => set.has(p.id));
  }

  isFavorite(id: string): boolean {
    return this.ids().includes(id);
  }

  toggle(id: string): 'added' | 'removed' {
    const added = !this.isFavorite(id);
    const next = added ? [...this.ids(), id] : this.ids().filter((x) => x !== id);
    this.ids.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return added ? 'added' : 'removed';
  }

  private read(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }
}
