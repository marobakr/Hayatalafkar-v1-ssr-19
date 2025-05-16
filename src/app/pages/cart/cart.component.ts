import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import {
  IAddToCartOrOrder,
  OrderDetail,
} from '@core/interfaces/cart.interfaces';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { CartStateService } from '../../core/services/cart/cart-state.service';
import { ServiceCardComponent } from '../about-us/components/service-card/service-card.component';
import { ArticlesHeaderComponent } from '../articles/components/articles-header/articles-header.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AsyncPipe,
    ImageUrlDirective,
    CustomTranslatePipe,
    ArticlesHeaderComponent,
    TranslateModule,
    ServiceCardComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  _cartState = inject(CartStateService);
  _languageService = inject(LanguageService);
  formBuilder = inject(FormBuilder);

  // Expose computed signals for template usage
  items = this._cartState.orderDetails;

  subtotal = this._cartState.subtotal;

  total = this._cartState.total;

  tax = this._cartState.tax;

  shipping = this._cartState.shipping;

  discount = this._cartState.discount;

  itemCount = this._cartState.itemCount;

  isEmpty = this._cartState.isEmpty;

  currentLang$ = this._languageService.getLanguage();

  isPromoCodeLoading = false;

  promoCodeForm: FormGroup = this.formBuilder.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
  });

  promoCodeError: string | null = null;

  promoCodeSuccess: string | null = null;

  ngOnInit(): void {
    this._cartState.fetchCart();
  }

  /**
   * Add an item to the cart
   */
  addToCart(productId: number, quantity: number = 1, choiceId?: string) {
    const item: IAddToCartOrOrder = {
      product_id: productId,
      quantity: quantity,
      choice_id: choiceId,
    };

    if (choiceId) {
      item.choice_id = choiceId;
    }

    this._cartState.addToCart(item).subscribe({
      next: () => {
        // Handle success if needed
      },
      error: (err) => {
        console.error('Error adding item to cart', err);
      },
    });
  }

  /**
   * Calculate item total price
   */
  calculateItemTotal(item: OrderDetail): number {
    return item.quantity * parseFloat(item.unit_price);
  }

  /**
   * Format number to display as currency
   */
  formatPrice(price: string | number | null | undefined): string {
    if (price === null || price === undefined) return '0.00';

    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  }

  /**
   * Increase item quantity by 1
   */
  increaseQuantity(item: OrderDetail): void {
    this.updateQuantity(item.product_id, item.quantity + 1);
  }

  /**
   * Decrease item quantity by 1
   */
  decreaseQuantity(item: OrderDetail): void {
    if (item.quantity > 1) {
      this.updateQuantity(item.product_id, item.quantity - 1);
    } else {
      this.removeItem(item.product_id);
    }
  }

  /**
   * Update the quantity of an item directly
   */
  updateQuantity(productId: string | number, quantity: number) {
    if (quantity > 0) {
      this._cartState.updateQuantity(productId, quantity).subscribe({
        error: (err) => {
          console.error('Error updating quantity', err);
        },
      });
    } else {
      this.removeItem(productId);
    }
  }

  /**
   * Remove an item from the cart
   */
  removeItem(productId: string | number) {
    this._cartState.removeItem(productId).subscribe({
      error: (err) => {
        console.error('Error removing item', err);
      },
    });
  }

  /**
   * Clear all items from the cart
   */
  clearCart() {
    this._cartState.clearCart().subscribe({
      error: (err) => {
        console.error('Error clearing cart', err);
      },
    });
  }

  /**
   * Apply a promo code to the cart
   */
  applyPromoCode() {
    if (this.promoCodeForm.valid) {
      const code = this.promoCodeForm.get('code')?.value;
      this.promoCodeError = null;
      this.promoCodeSuccess = null;
      this.isPromoCodeLoading = true;

      this._cartState.applyPromoCode(code).subscribe({
        next: (response) => {
          this.isPromoCodeLoading = false;
          if (response.valid) {
            this.promoCodeSuccess = 'Promo code applied successfully!';
            this.promoCodeForm.reset();
          } else {
            this.promoCodeError = response.message || 'Invalid promo code.';
          }
        },
        error: (err) => {
          this.isPromoCodeLoading = false;
          this.promoCodeError = 'Error applying promo code. Please try again.';
          console.error('Error applying promo code', err);
        },
      });
    } else {
      // Mark form controls as touched to show validation errors
      this.promoCodeForm.markAllAsTouched();
    }
  }
}
