import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { NavigationComponent } from './layout/navigation/navigation.component';
import { MobileNavComponent } from './layout/mobile-nav/mobile-nav.component';
import { ToastComponent } from './shared/toast/toast.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    NavigationComponent,
    MobileNavComponent,
    ToastComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);

  readonly layoutFlags = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.readLayoutFlags()),
      startWith(this.readLayoutFlags()),
    ),
    { initialValue: { minimal: false, admin: false } },
  );

  private readLayoutFlags(): { minimal: boolean; admin: boolean } {
    let route = this.router.routerState.root;
    let minimal = false;
    let admin = false;
    while (route) {
      if (route.snapshot.data['minimalLayout']) minimal = true;
      if (route.snapshot.data['adminLayout']) admin = true;
      route = route.firstChild!;
      if (!route) break;
    }
    return { minimal, admin };
  }
}
