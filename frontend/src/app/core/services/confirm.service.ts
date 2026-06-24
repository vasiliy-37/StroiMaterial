import { Injectable, signal } from '@angular/core';

type ConfirmState = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  resolve: (value: boolean) => void;
};

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly state = signal<ConfirmState | null>(null);
  readonly dialog = this.state.asReadonly();

  confirm(
    message: string,
    options?: { title?: string; confirmLabel?: string; cancelLabel?: string },
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({
        title: options?.title ?? 'Подтверждение',
        message,
        confirmLabel: options?.confirmLabel ?? 'Да',
        cancelLabel: options?.cancelLabel ?? 'Отмена',
        resolve,
      });
    });
  }

  answer(value: boolean): void {
    const current = this.state();
    if (current) {
      current.resolve(value);
    }
    this.state.set(null);
  }
}
