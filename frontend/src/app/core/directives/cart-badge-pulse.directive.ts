import { Directive, ElementRef, effect, inject } from '@angular/core';
import { CartService } from '../services/cart.service';

@Directive({
  selector: '[appCartBadgePulse]',
})
export class CartBadgePulseDirective {
  private readonly cart = inject(CartService);
  private readonly el = inject(ElementRef<HTMLElement>);

  constructor() {
    effect(() => {
      const tick = this.cart.itemAddedTick();
      if (!tick) return;

      const node = this.el.nativeElement;
      node.classList.remove('badge-count--pulse');
      void node.offsetWidth;
      node.classList.add('badge-count--pulse');
    });
  }
}
