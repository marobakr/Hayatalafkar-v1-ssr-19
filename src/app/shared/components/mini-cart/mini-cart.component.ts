import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStateService } from '../../../core/services/common/cart-state.service';

@Component({
  selector: 'app-mini-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mini-cart.component.html',
  styleUrl: './mini-cart.component.css',
})
export class MiniCartComponent {
  cartState = inject(CartStateService);
  isOpen = false;

  toggleCartDropdown() {
    this.isOpen = !this.isOpen;
  }

  removeItem(productId: string | number) {
    this.cartState.removeItem(productId).subscribe();
  }
}
