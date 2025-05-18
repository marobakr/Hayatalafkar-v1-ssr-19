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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHtmlComponent } from '../../core/safe-html/safe-html.component';
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
    SafeHtmlComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  _cartState = inject(CartStateService);

  _languageService = inject(LanguageService);

  formBuilder = inject(FormBuilder);

  _translateService = inject(TranslateService);

  // Expose computed signals for template usage
  order = this._cartState.order;

  promoCode = this._cartState.promoCode;

  user = this._cartState.user;

  orderDetails = this._cartState.orderDetails;

  isEmpty = this._cartState.isEmpty;

  currentLang$ = this._languageService.getLanguage();

  isPromoCodeLoading = false;
  isRemovingItem = false;
  isAddingItem = false;
  isClearingCart = false;
  removeItemError: string | null = null;
  cartUpdateSuccess: string | null = null;

  // Track which item is currently being removed by ID
  removingItemId: string | number | null = null;
  // Track which item is currently being updated by ID
  updatingItemId: string | number | null = null;

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

    this.isAddingItem = true;
    this.cartUpdateSuccess = null;
    this.removeItemError = null;

    this._cartState.addToCart(item).subscribe({
      next: () => {
        this.isAddingItem = false;
        this.cartUpdateSuccess = this._translateService.instant(
          'shared.added_to_cart_success'
        );
        setTimeout(() => (this.cartUpdateSuccess = null), 3000);
      },
      error: (err) => {
        this.isAddingItem = false;
        this.removeItemError = this._translateService.instant(
          'cart.error.add_failed'
        );
        console.error('Error adding item to cart', err);
        setTimeout(() => (this.removeItemError = null), 3000);
      },
    });
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
      this.removeItem(item);
    }
  }

  /**
   * Update the quantity of an item directly
   */
  updateQuantity(productId: string | number, quantity: number) {
    // Get the order detail object for this product
    const cartItem = this._cartState.getCartItemForProduct(productId);
    if (!cartItem) {
      console.warn('Cannot update item: Product not found in cart');
      return;
    }

    if (quantity > 0) {
      this.isAddingItem = true;
      this.updatingItemId = productId;
      this.cartUpdateSuccess = null;
      this.removeItemError = null;

      this._cartState.updateQuantity(productId, quantity).subscribe({
        next: () => {
          this.isAddingItem = false;
          this.updatingItemId = null;
          this.cartUpdateSuccess = this._translateService.instant(
            'shared.update_cart_quantity'
          );
          setTimeout(() => (this.cartUpdateSuccess = null), 3000);
        },
        error: (err) => {
          this.isAddingItem = false;
          this.updatingItemId = null;
          this.removeItemError = this._translateService.instant(
            'cart.error.update_failed'
          );
          console.error('Error updating quantity', err);
          setTimeout(() => (this.removeItemError = null), 3000);
        },
      });
    } else {
      this.removeItem(cartItem);
    }
  }

  /**
   * Remove an item from the cart
   */
  removeItem(orderDetail: OrderDetail) {
    this.isRemovingItem = true;
    this.removingItemId = orderDetail.id;
    this.cartUpdateSuccess = null;
    this.removeItemError = null;

    this._cartState.removeItem(orderDetail.id).subscribe({
      next: () => {
        this.isRemovingItem = false;
        this.removingItemId = null;
        this.cartUpdateSuccess =
          this._translateService.instant('cart.item_removed');
        setTimeout(() => (this.cartUpdateSuccess = null), 3000);
      },
      error: (err) => {
        this.isRemovingItem = false;
        this.removingItemId = null;
        this.removeItemError = this._translateService.instant(
          'cart.error.remove_failed'
        );
        console.error('Error removing item', err);
        setTimeout(() => (this.removeItemError = null), 3000);
      },
    });
  }

  /**
   * Clear all items from the cart
   */
  clearCart() {
    this.isClearingCart = true;
    this.cartUpdateSuccess = null;
    this.removeItemError = null;

    this._cartState.clearCart().subscribe({
      next: () => {
        this.isClearingCart = false;
        this.cartUpdateSuccess =
          this._translateService.instant('cart.cart_cleared');
        setTimeout(() => (this.cartUpdateSuccess = null), 3000);
      },
      error: (err) => {
        this.isClearingCart = false;
        this.removeItemError = this._translateService.instant(
          'cart.error.clear_failed'
        );
        console.error('Error clearing cart', err);
        setTimeout(() => (this.removeItemError = null), 3000);
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
            this.promoCodeSuccess = this._translateService.instant(
              'cart.promo-code.success'
            );
            this.promoCodeForm.reset();
          } else {
            this.promoCodeError =
              response.message ||
              this._translateService.instant('cart.promo-code.invalid-code');
          }
        },
        error: (err) => {
          this.isPromoCodeLoading = false;
          this.promoCodeError = this._translateService.instant(
            'cart.promo-code.error-applying'
          );
          console.error('Error applying promo code', err);
        },
      });
    } else {
      // Mark form controls as touched to show validation errors
      this.promoCodeForm.markAllAsTouched();
    }
  }

  /* Calculate Total Price */
}
