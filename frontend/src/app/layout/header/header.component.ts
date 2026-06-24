import { Component, inject, HostListener, ElementRef } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../core/services/language.service';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { Lang } from '../../core/i18n/translations';
import { CartBadgePulseDirective } from '../../core/directives/cart-badge-pulse.directive';

@Component({
  selector: 'app-header',
  imports: [RouterLink, FormsModule, UpperCasePipe, CartBadgePulseDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly i18n = inject(LanguageService);
  readonly cart = inject(CartService);
  readonly favorites = inject(FavoritesService);
  private readonly router = inject(Router);
  private readonly el = inject(ElementRef);

  searchQuery = '';

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.i18n.toggleDropdown.set(false);
    }
  }

  toggleLangMenu(): void {
    this.i18n.toggleDropdown.update((v) => !v);
  }

  selectLang(code: Lang): void {
    this.i18n.setLang(code);
    this.i18n.toggleDropdown.set(false);
  }

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (q) {
      this.router.navigate(['/search'], { queryParams: { q } });
    }
  }

  t(key: string): string {
    return this.i18n.t(key);
  }
}
