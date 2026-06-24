import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';

import { CatalogComponent } from './pages/catalog/catalog.component';

import { ProductComponent } from './pages/product/product.component';

import { CartComponent } from './pages/cart/cart.component';

import { CheckoutComponent } from './pages/checkout/checkout.component';

import { OrderSuccessComponent } from './pages/order-success/order-success.component';

import { OrdersComponent } from './pages/orders/orders.component';

import { OrderDetailComponent } from './pages/order-detail/order-detail.component';

import { ProfileLayoutComponent } from './pages/profile/profile-layout.component';
import { ProfileHomeComponent } from './pages/profile/profile-home.component';

import { AuthComponent } from './pages/auth/auth.component';

import { FavoritesComponent } from './pages/favorites/favorites.component';

import { SearchComponent } from './pages/search/search.component';

import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';

import { DashboardComponent } from './admin/dashboard/dashboard.component';

import { ProductsAdminComponent } from './admin/products-admin/products-admin.component';

import { ServicesAdminComponent } from './admin/services-admin/services-admin.component';

import { PromotionsAdminComponent } from './admin/promotions-admin/promotions-admin.component';

import { ContentAdminComponent } from './admin/content-admin/content-admin.component';

import { OrdersAdminComponent } from './admin/orders-admin/orders-admin.component';

import { NotFoundComponent } from './pages/not-found/not-found.component';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';



export const routes: Routes = [

  { path: '', component: HomeComponent },

  { path: 'catalog', component: CatalogComponent },

  { path: 'product/:id', component: ProductComponent },

  { path: 'cart', component: CartComponent },

  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },

  { path: 'order-success', component: OrderSuccessComponent },

  {
    path: 'profile',
    component: ProfileLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: ProfileHomeComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'orders/:id', component: OrderDetailComponent },
    ],
  },

  { path: 'orders', redirectTo: '/profile/orders', pathMatch: 'full' },
  { path: 'orders/:id', redirectTo: '/profile/orders/:id', pathMatch: 'full' },

  { path: 'auth', component: AuthComponent, data: { minimalLayout: true } },

  { path: 'favorites', component: FavoritesComponent },

  { path: 'search', component: SearchComponent },

  {

    path: 'admin',

    component: AdminLayoutComponent,

    data: { adminLayout: true },

    children: [

      { path: '', component: DashboardComponent, canActivate: [adminGuard] },

      { path: 'products', component: ProductsAdminComponent, canActivate: [adminGuard] },

      { path: 'services', component: ServicesAdminComponent, canActivate: [adminGuard] },

      { path: 'promotions', component: PromotionsAdminComponent, canActivate: [adminGuard] },

      { path: 'content', component: ContentAdminComponent, canActivate: [adminGuard] },

      { path: 'orders', component: OrdersAdminComponent, canActivate: [adminGuard] },

    ],

  },

  { path: '**', component: NotFoundComponent },

];


