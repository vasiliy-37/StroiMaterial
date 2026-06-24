import { Component, effect, input, signal } from '@angular/core';

const PLACEHOLDER = '/images/product-placeholder.svg';

@Component({
  selector: 'app-product-image',
  template: `<img [src]="currentSrc()" [alt]="alt()" [class]="imgClass()" (error)="onError()" loading="lazy" />`,
  styles: `:host { display: contents; } img { max-width: 100%; }`,
})
export class ProductImageComponent {
  readonly src = input.required<string>();
  readonly alt = input('');
  readonly imgClass = input('');

  readonly currentSrc = signal(PLACEHOLDER);

  constructor() {
    effect(() => {
      const value = this.src()?.trim();
      this.currentSrc.set(value || PLACEHOLDER);
    });
  }

  onError(): void {
    if (this.currentSrc() !== PLACEHOLDER) {
      this.currentSrc.set(PLACEHOLDER);
    }
  }
}
