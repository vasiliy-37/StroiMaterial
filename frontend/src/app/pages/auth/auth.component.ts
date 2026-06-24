import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-auth',
  imports: [RouterLink, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  readonly i18n = inject(LanguageService);
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  mode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  confirmPassword = '';
  name = '';
  error = signal<string | null>(null);
  loading = signal(false);

  t(key: string): string {
    return this.i18n.t(key);
  }

  toggleMode(): void {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error.set(null);
    this.confirmPassword = '';
  }

  submit(): void {
    this.error.set(null);

    if (this.mode === 'register' && this.password !== this.confirmPassword) {
      this.error.set(this.t('auth.passwordMismatch'));
      return;
    }

    this.loading.set(true);
    const req =
      this.mode === 'login'
        ? this.auth.login(this.email.trim(), this.password)
        : this.auth.register(this.email.trim(), this.password, this.name.trim() || undefined);

    req.subscribe({
      next: () => {
        this.cart.onLogin();
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.error.set(this.t('auth.emailTaken'));
        } else if (err.status === 400) {
          const msg = err.error?.message;
          this.error.set(
            Array.isArray(msg) ? msg.join(', ') : msg ? String(msg) : this.t('auth.invalidData'),
          );
        } else if (err.status === 401 && this.mode === 'login') {
          this.error.set(this.t('auth.invalidCredentials'));
        } else if (err.status === 0) {
          this.error.set(this.t('auth.noConnection'));
        } else {
          this.error.set(this.t('auth.genericError'));
        }
      },
      complete: () => this.loading.set(false),
    });
  }
}
