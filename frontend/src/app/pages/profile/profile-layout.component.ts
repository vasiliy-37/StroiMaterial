import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-profile-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './profile-layout.component.html',
  styleUrl: './profile-layout.component.scss',
})
export class ProfileLayoutComponent {
  readonly i18n = inject(LanguageService);
  readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);

  readonly menu = [
    { icon: 'person', labelKey: 'profile.myProfile', route: '/profile' },
    { icon: 'inventory_2', labelKey: 'profile.orders', route: '/profile/orders' },
  ];

  t(key: string): string {
    return this.i18n.t(key);
  }

  logout(): void {
    this.auth.logout();
    this.cart.onLogout();
    this.router.navigate(['/']);
  }
}
