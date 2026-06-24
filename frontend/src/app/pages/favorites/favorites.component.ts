import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';

@Component({
  selector: 'app-favorites',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent {
  readonly i18n = inject(LanguageService);
  readonly favorites = inject(FavoritesService);

  readonly products = computed(() => this.favorites.products());

  t(key: string): string {
    return this.i18n.t(key);
  }
}
