import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { CatalogStoreService } from '../../core/services/catalog-store.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/product-card-skeleton/product-card-skeleton.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCardComponent, ProductCardSkeletonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly i18n = inject(LanguageService);
  readonly store = inject(CatalogStoreService);

  readonly products = computed(() => this.store.products().slice(0, 4));
  readonly serviceItems = computed(() => this.store.services());
  readonly heroImage = computed(() => this.store.heroImage());
  readonly promotions = computed(() => this.store.promotions());

  t(key: string): string {
    return this.i18n.t(key);
  }

  serviceTitle(item: { titleRu: string; titleEn: string }): string {
    return this.i18n.lang() === 'en' ? item.titleEn : item.titleRu;
  }

  serviceDesc(item: { descRu: string; descEn: string }): string {
    return this.i18n.lang() === 'en' ? item.descEn : item.descRu;
  }

  promoTitle(item: { titleRu: string; titleEn: string }): string {
    return this.i18n.lang() === 'en' ? item.titleEn : item.titleRu;
  }

  promoDesc(item: { descriptionRu: string; descriptionEn: string }): string {
    return this.i18n.lang() === 'en' ? item.descriptionEn : item.descriptionRu;
  }

  formatDate(value: string): string {
    const [y, m, d] = value.split('-');
    return `${d}.${m}.${y}`;
  }
}
