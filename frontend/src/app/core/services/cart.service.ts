import { Injectable, inject, signal, computed, effect } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { tap, catchError, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';

import { AuthService } from './auth.service';

import { CatalogStoreService } from './catalog-store.service';

import { buildGuestLine } from '../utils/pricing.util';



export type CartItemView = {

  id: string;

  productId: string;

  quantity: number;

  unitPrice: number;

  product: {

    id: string;

    name: string;

    nameEn: string;

    price: number;

    oldPrice?: number;

    image: string;

    badge?: 'sale' | 'pro';

    stock: number;

    stockQty: number;

    stockLabel: string;

    stockLabelEn: string;

    brand: string;

    category: string;

    active: boolean;

  };

  lineTotal: number;

};



export type CartView = {

  id: string;

  items: CartItemView[];

  total: number;

  itemCount: number;

};



type GuestCartEntry = { productId: string; quantity: number };



const EMPTY_CART: CartView = { id: '', items: [], total: 0, itemCount: 0 };

const GUEST_CART_KEY = 'buildpro-guest-cart';



@Injectable({ providedIn: 'root' })

export class CartService {

  private readonly http = inject(HttpClient);

  private readonly auth = inject(AuthService);

  private readonly store = inject(CatalogStoreService);

  private readonly api = environment.apiUrl;
  private readonly useMocks = environment.useMocks;

  private readonly cartSignal = signal<CartView>(EMPTY_CART);

  private readonly itemAddedSignal = signal(0);

  private readonly guestMode = signal(!this.auth.isLoggedIn());



  readonly cart = this.cartSignal.asReadonly();

  readonly itemCount = computed(() => this.cartSignal().itemCount);

  readonly itemAddedTick = this.itemAddedSignal.asReadonly();

  readonly isGuestCart = this.guestMode.asReadonly();



  constructor() {

    effect(() => {

      this.store.products();

      if (!this.auth.isLoggedIn()) {

        this.syncGuestCartView();

      }

    });



    if (this.auth.isLoggedIn()) {

      this.refresh().subscribe();

    } else {

      this.syncGuestCartView();

    }

  }



  private localCart(): boolean {
    return this.useMocks || this.guestMode();
  }

  refresh() {

    if (this.useMocks || !this.auth.isLoggedIn()) {

      this.guestMode.set(true);

      this.syncGuestCartView();

      return of(this.cartSignal());

    }



    this.guestMode.set(false);

    return this.http.get<CartView>(`${this.api}/cart`).pipe(

      tap((cart) => this.cartSignal.set(cart)),

      catchError(() => {

        this.cartSignal.set(EMPTY_CART);

        return of(EMPTY_CART);

      }),

    );

  }



  addItem(productId: string, quantity = 1) {

    if (this.useMocks || !this.auth.isLoggedIn()) {

      return this.addGuestItem(productId, quantity);

    }



    return this.http.post<CartView>(`${this.api}/cart/items`, { productId, quantity }).pipe(

      tap((cart) => {

        this.cartSignal.set(cart);

        this.itemAddedSignal.update((n) => n + 1);

      }),

    );

  }



  updateItem(itemId: string, quantity: number) {

    if (this.localCart()) {

      const productId = itemId.replace(/^guest-/, '');

      return this.setGuestQuantity(productId, quantity);

    }



    return this.http

      .patch<CartView>(`${this.api}/cart/items/${itemId}`, { quantity })

      .pipe(tap((cart) => this.cartSignal.set(cart)));

  }



  removeItem(itemId: string) {

    if (this.localCart()) {

      const productId = itemId.replace(/^guest-/, '');

      return this.removeGuestItem(productId);

    }



    return this.http

      .delete<CartView>(`${this.api}/cart/items/${itemId}`)

      .pipe(tap((cart) => this.cartSignal.set(cart)));

  }



  clear() {

    if (this.localCart()) {

      this.writeGuestCart([]);

      this.syncGuestCartView();

      return of(this.cartSignal());

    }



    return this.http.delete<CartView>(`${this.api}/cart`).pipe(

      tap((cart) => this.cartSignal.set(cart)),

    );

  }



  onLogin(): void {

    if (this.useMocks) {
      this.guestMode.set(true);
      this.syncGuestCartView();
      return;
    }

    const guestItems = this.readGuestCart();

    this.guestMode.set(false);



    if (!guestItems.length) {

      this.refresh().subscribe();

      return;

    }



    this.http

      .post<CartView>(`${this.api}/cart/merge`, { items: guestItems })

      .pipe(

        tap((cart) => {

          this.writeGuestCart([]);

          this.cartSignal.set(cart);

        }),

        catchError(() => this.refresh()),

      )

      .subscribe();

  }



  onLogout(): void {

    this.writeGuestCart([]);

    this.guestMode.set(true);

    this.cartSignal.set(EMPTY_CART);

  }



  private addGuestItem(productId: string, quantity: number) {

    const product = this.store.getProductById(productId);

    if (!product) {

      return of(EMPTY_CART);

    }



    const entries = this.readGuestCart();

    const existing = entries.find((e) => e.productId === productId);

    const newQty = (existing?.quantity ?? 0) + quantity;



    if ((product.stockQty ?? 0) <= 0) {

      return throwError(() => new Error('Out of stock'));

    }

    if (newQty > (product.stockQty ?? 0)) {

      return throwError(() => new Error(`Only ${product.stockQty} available`));

    }



    if (existing) {

      existing.quantity = newQty;

    } else {

      entries.push({ productId, quantity });

    }



    this.writeGuestCart(entries);

    this.syncGuestCartView();

    this.itemAddedSignal.update((n) => n + 1);

    return of(this.cartSignal());

  }



  private setGuestQuantity(productId: string, quantity: number) {

    const product = this.store.getProductById(productId);

    if (!product) return of(this.cartSignal());



    if (quantity > (product.stockQty ?? 0)) {

      return throwError(() => new Error(`Only ${product.stockQty} available`));

    }



    const entries = this.readGuestCart().map((e) =>

      e.productId === productId ? { ...e, quantity } : e,

    );

    this.writeGuestCart(entries);

    this.syncGuestCartView();

    return of(this.cartSignal());

  }



  private removeGuestItem(productId: string) {

    const entries = this.readGuestCart().filter((e) => e.productId !== productId);

    this.writeGuestCart(entries);

    this.syncGuestCartView();

    return of(this.cartSignal());

  }



  private syncGuestCartView(): void {

    const promotions = this.store.promotions();

    const items = this.readGuestCart()

      .map((entry) => {

        const product = this.store.getProductById(entry.productId);

        if (!product) return null;

        return buildGuestLine(product, entry.quantity, promotions);

      })

      .filter((item): item is CartItemView => item != null);



    const total = Math.round(items.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;

    this.cartSignal.set({

      id: 'guest',

      items,

      total,

      itemCount: items.reduce((s, i) => s + i.quantity, 0),

    });

  }



  private readGuestCart(): GuestCartEntry[] {

    try {

      const raw = localStorage.getItem(GUEST_CART_KEY);

      return raw ? (JSON.parse(raw) as GuestCartEntry[]) : [];

    } catch {

      return [];

    }

  }



  private writeGuestCart(entries: GuestCartEntry[]): void {

    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(entries));

  }

}


