import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MOCK_ACCESS_TOKEN, MOCK_ACCOUNTS } from '../mocks/auth.mock';

export type AuthUser = {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  role: 'USER' | 'ADMIN';
};

type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

const TOKEN_KEY = 'buildpro-token';
const USER_KEY = 'buildpro-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;
  private readonly useMocks = environment.useMocks;

  private readonly tokenSignal = signal<string | null>(this.readToken());
  private readonly userSignal = signal<AuthUser | null>(this.readUser());

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.tokenSignal());
  readonly isAdmin = computed(() => this.userSignal()?.role === 'ADMIN');

  login(email: string, password: string) {
    if (this.useMocks) {
      const account = MOCK_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
      );
      if (!account) {
        return throwError(() => ({ error: { message: 'Invalid email or password' } }));
      }
      const res: AuthResponse = { accessToken: MOCK_ACCESS_TOKEN, user: account.user };
      return of(res).pipe(delay(200), tap((r) => this.persist(r)));
    }

    return this.http
      .post<AuthResponse>(`${this.api}/auth/login`, { email, password })
      .pipe(tap((res) => this.persist(res)));
  }

  register(email: string, password: string, name?: string) {
    if (this.useMocks) {
      const exists = MOCK_ACCOUNTS.some(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
      );
      if (exists) {
        return throwError(() => ({ error: { message: 'User already exists' } }));
      }
      const user: AuthUser = {
        id: `mock-${Date.now()}`,
        email: email.trim(),
        phone: null,
        name: name?.trim() || null,
        role: 'USER',
      };
      const res: AuthResponse = { accessToken: MOCK_ACCESS_TOKEN, user };
      return of(res).pipe(delay(200), tap((r) => this.persist(r)));
    }

    return this.http
      .post<AuthResponse>(`${this.api}/auth/register`, { email, password, name })
      .pipe(tap((res) => this.persist(res)));
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private persist(res: AuthResponse): void {
    this.tokenSignal.set(res.accessToken);
    this.userSignal.set(res.user);
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
  }

  private readToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private readUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
