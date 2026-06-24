import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  readonly confirm = inject(ConfirmService);

  accept(): void {
    this.confirm.answer(true);
  }

  cancel(): void {
    this.confirm.answer(false);
  }
}
