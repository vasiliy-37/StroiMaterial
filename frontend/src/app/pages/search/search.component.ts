import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { CatalogStoreService } from '../../core/services/catalog-store.service';
import { Product } from '../../core/models/catalog.models';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/product-card-skeleton/product-card-skeleton.component';

@Component({
  selector: 'app-search',
  imports: [RouterLink, ProductCardComponent, ProductCardSkeletonComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  readonly i18n = inject(LanguageService);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(CatalogStoreService);

  query = '';
  readonly results = signal<Product[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.query = params.get('q') ?? '';
      this.loading.set(true);
      this.store.searchProducts(this.query).subscribe({
        next: (items) => {
          this.results.set(items);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    });
  }

  t(key: string): string {
    return this.i18n.t(key);
  }
}
