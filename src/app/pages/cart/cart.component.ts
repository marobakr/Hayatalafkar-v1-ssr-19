import { AnimationEvent } from '@angular/animations';
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
import { CartStateService } from '@core/services/cart/cart-state.service';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AlertService } from '@shared/alert/alert.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { CartSkeletonComponent } from '@shared/components/skeleton/cart-skeleton/cart-skeleton.component';
import { SafeHtmlComponent } from '../../core/safe-html/safe-html.component';
import { ArticlesHeaderComponent } from '../../pages/articles/components/articles-header/articles-header.component';
import { ServiceCardComponent } from '../about-us/components/service-card/service-card.component';
import { IAboutUsTwo } from '../about-us/res/about-us.interface';
import { AboutUsService } from '../about-us/res/about-us.service';
import { cartItemAnimations } from './cart.animations';

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
    LoadingComponent,
    CartSkeletonComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  animations: cartItemAnimations,
})
export class CartComponent implements OnInit {
  _cartState = inject(CartStateService);

  _languageService = inject(LanguageService);

  formBuilder = inject(FormBuilder);

  _translateService = inject(TranslateService);

  _alertService = inject(AlertService);

  _aboutUsService = inject(AboutUsService);

  // Loading state to show loading indicator
  isLoading = true;

  // Expose computed signals for template usage
  order = this._cartState.order;

  promoCode = this._cartState.promoCode;

  user = this._cartState.user;

  orderDetails = this._cartState.orderDetails;

  isEmpty = this._cartState.isEmpty;

  currentLang$ = this._languageService.getLanguage();

  isPromoCodeLoading = false;

  ngOnInit(): void {
    // Start with loading state
    this.isLoading = true;

    // First check if user has confirmed orders
    this._cartState.checkConfirmedOrders().subscribe();

    // Then fetch the cart
    this._cartState.fetchCart().subscribe({
      next: () => {
        // Once cart data is loaded, disable loading state
        this.isLoading = false;

        // Initialize cart data with animation states
        const cartDetails = this.orderDetails();

        // Set all items to visible animation state
        if (cartDetails && cartDetails.length > 0) {
          this._cartState.setOrderDetails(
            cartDetails.map((item) => ({
              ...item,
              animationState: 'visible',
            }))
          );
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching cart during initialization', err);
      },
    });

    this.getAboutData();
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
        // Set loading state while fetching updated cart
        this.isLoading = true;

        // Refresh both the cart in this component and the count in navbar
        this._cartState.fetchCart().subscribe({
          next: () => {
            this.isLoading = false;
            this.isAddingItem = false;
            this.cartUpdateSuccess = this._translateService.instant(
              'shared.added_to_cart_success'
            );
            setTimeout(() => (this.cartUpdateSuccess = null), 3000);
          },
          error: (err) => {
            this.isLoading = false;
            this.isAddingItem = false;
            console.error('Error fetching cart after adding item', err);
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
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

  // Track which item is currently being removed by ID
  removingItemId: string | number | null = null;
  // Track which item is currently being updated by ID
  updatingItemId: string | number | null = null;

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
          // Set loading state while fetching updated cart
          this.isLoading = true;

          // Refresh cart to get updated data
          this._cartState.fetchCart().subscribe({
            next: () => {
              this.isLoading = false;
              this.isAddingItem = false;
              this.updatingItemId = null;
              this.cartUpdateSuccess = this._translateService.instant(
                'shared.update_cart_quantity'
              );
              setTimeout(() => (this.cartUpdateSuccess = null), 3000);
            },
            error: (err) => {
              this.isLoading = false;
              this.isAddingItem = false;
              this.updatingItemId = null;
              console.error('Error fetching cart after update', err);
            },
          });
        },
        error: (err) => {
          this.isLoading = false;
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

  isRemovingItem = false;

  isAddingItem = false;

  isClearingCart = false;

  removeItemError: string | null = null;

  cartUpdateSuccess: string | null = null;

  /**
   * Remove an item from the cart
   */
  removeItem(orderDetail: OrderDetail) {
    // Set the animation state to trigger fadeOut
    this.setItemAnimationState(orderDetail.id, 'fadeOut');

    // Mark item as being removed
    this.removingItemId = orderDetail.id;
    this.cartUpdateSuccess = null;
    this.removeItemError = null;

    // Visual state is handled by the animation,
    // actual removal happens in performItemRemoval after animation completes
  }

  /**
   * Perform the actual API call to remove an item
   */
  performItemRemoval(orderDetail: OrderDetail) {
    this.isRemovingItem = true;

    this._cartState.removeItem(orderDetail.id).subscribe({
      next: () => {
        // Set loading state while fetching updated cart
        this.isLoading = true;

        // Refresh cart to get updated data
        this._cartState.fetchCart().subscribe({
          next: () => {
            this.isLoading = false;
            this.isRemovingItem = false;
            this.removingItemId = null;

            this._alertService.showNotification({
              imagePath: '/images/common/after-remove.webp',
              translationKeys: {
                title: 'alerts.cart.remove_success.title',
              },
            }); // Show success notification (without buttons)
          },
          error: (err) => {
            this.isLoading = false;
            this.isRemovingItem = false;
            this.removingItemId = null;
            console.error('Error fetching cart after removal', err);
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
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
        // Set loading state while fetching updated cart
        this.isLoading = true;

        // Refresh cart to get updated data
        this._cartState.fetchCart().subscribe({
          next: () => {
            this.isLoading = false;
            this.isClearingCart = false;
            this.cartUpdateSuccess =
              this._translateService.instant('cart.cart_cleared');
            setTimeout(() => (this.cartUpdateSuccess = null), 3000);
          },
          error: (err) => {
            this.isLoading = false;
            this.isClearingCart = false;
            console.error('Error fetching cart after clearing', err);
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
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

  promoCodeForm: FormGroup = this.formBuilder.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
  });

  promoCodeError: string | null = null;

  promoCodeSuccess: string | null = null;

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
            // Set loading state while fetching updated cart
            this.isLoading = true;

            // Refresh cart to get updated data with the applied promo code
            this._cartState.fetchCart().subscribe({
              next: () => {
                this.isLoading = false;
                this.promoCodeSuccess = this._translateService.instant(
                  'cart.promo-code.success'
                );
                this.promoCodeForm.reset();
              },
              error: (err) => {
                this.isLoading = false;
                console.error(
                  'Error fetching cart after applying promo code',
                  err
                );
              },
            });
          } else {
            this.isPromoCodeLoading = false;
            this.isLoading = false;
            this.promoCodeError =
              response.message ||
              this._translateService.instant('cart.promo-code.invalid-code');
          }
        },
        error: (err) => {
          this.isLoading = false;
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

  // Helper method to set animation state on an item
  setItemAnimationState(id: number, state: 'visible' | 'fadeOut'): void {
    const items = this.orderDetails();
    if (items) {
      const updatedItems = items.map((item) => {
        if (item.id === id) {
          return { ...item, animationState: state };
        }
        return item;
      });

      this._cartState.setOrderDetails(updatedItems);
    }
  }

  // Handle animation completion
  onAnimationDone(event: AnimationEvent, item: OrderDetail): void {
    if (event.toState === 'fadeOut') {
      // Now proceed with the actual item removal
      this.performItemRemoval(item);
    }
  }

  aboutUsTwo: IAboutUsTwo = {} as IAboutUsTwo;

  getAboutData() {
    this._aboutUsService.getAboutData().subscribe((res: IAboutUsTwo) => {
      this.aboutUsTwo = res;
    });
  }
}
