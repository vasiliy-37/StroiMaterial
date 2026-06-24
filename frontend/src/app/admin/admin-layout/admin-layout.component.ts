import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { CatalogStoreService } from '../../core/services/catalog-store.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, FormsModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly store = inject(CatalogStoreService);
  readonly showDevCredentials = !environment.production;

  readonly nav = [
    { path: '/admin', label: 'Обзор', icon: 'dashboard', exact: true },
    { path: '/admin/products', label: 'Товары', icon: 'inventory_2' },
    { path: '/admin/services', label: 'Услуги', icon: 'handyman' },
    { path: '/admin/promotions', label: 'Акции', icon: 'sell' },
    { path: '/admin/content', label: 'Тексты сайта', icon: 'edit_note' },
    { path: '/admin/orders', label: 'Заказы', icon: 'receipt_long' },
  ];

  email = 'admin@buildpro.ru';
  password = 'admin123';
  readonly loginError = signal<string | null>(null);
  readonly loggingIn = signal(false);

  ngOnInit(): void {
    if (this.auth.isAdmin()) {
      this.store.loadAdminData().subscribe({ error: () => this.store.refresh().subscribe() });
    }
  }

  login(): void {
    this.loginError.set(null);
    this.loggingIn.set(true);
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        if (!this.auth.isAdmin()) {
          this.auth.logout();
          this.loginError.set('Этот аккаунт не администратор.');
          this.loggingIn.set(false);
          return;
        }
        this.store.loadAdminData().subscribe({
          next: () => this.loggingIn.set(false),
          error: () => {
            this.loggingIn.set(false);
            this.loginError.set('Вход выполнен, но не удалось загрузить данные админки. Проверьте API.');
          },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.loggingIn.set(false);
        const msg = err.error?.message;
        if (err.status === 0) {
          this.loginError.set('Нет связи с API. Запустите бэкенд: cd backend → npm run start:dev');
        } else if (err.status === 401) {
          this.loginError.set('Неверный email или пароль');
        } else if (err.status === 404) {
          this.loginError.set('API не найден. Перезапустите фронт: npm start');
        } else {
          this.loginError.set(msg ? String(msg) : `Ошибка ${err.status}. Перезапустите npm start в frontend.`);
        }
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
