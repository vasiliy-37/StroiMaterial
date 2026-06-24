import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-order-success',
  imports: [RouterLink],
  templateUrl: './order-success.component.html',
  styleUrl: './order-success.component.scss',
})
export class OrderSuccessComponent implements OnInit {
  readonly i18n = inject(LanguageService);
  private readonly route = inject(ActivatedRoute);

  orderNumber = '';

  ngOnInit(): void {
    this.orderNumber = this.route.snapshot.queryParamMap.get('order') ?? '';
  }

  t(key: string): string {
    return this.i18n.t(key);
  }
}
