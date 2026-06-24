import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { CartBadgePulseDirective } from '../../core/directives/cart-badge-pulse.directive';

@Component({
  selector: 'app-mobile-nav',
  imports: [RouterLink, RouterLinkActive, CartBadgePulseDirective],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.scss',
})
export class MobileNavComponent {
  readonly i18n = inject(LanguageService);
  readonly cart = inject(CartService);
  readonly favorites = inject(FavoritesService);

  t(key: string): string {
    return this.i18n.t(key);
  }
}
