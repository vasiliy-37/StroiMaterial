import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogStoreService } from '../../core/services/catalog-store.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly store = inject(CatalogStoreService);
}
