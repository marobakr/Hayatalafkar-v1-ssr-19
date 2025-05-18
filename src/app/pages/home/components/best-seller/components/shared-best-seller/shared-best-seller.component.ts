import { AsyncPipe, PercentPipe } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { AuthService } from '@core/services/auth/auth.service';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { LanguageService } from '@core/services/lang/language.service';
import { WishlistService } from '@core/services/wishlist/wishlist.service';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { BestProduct } from 'src/app/pages/home/res/home.interfaces';
import { IAllProduct } from 'src/app/pages/shopping/res/products.interface';
import { AlertService } from 'src/app/shared/alert/alert.service';
import { SafeHtmlComponent } from '../../../../../../core/safe-html/safe-html.component';

// Module-level Map to track loading state by product ID for isAddingToCart
const cartLoadingMap = new Map<number, boolean>();

@Component({
  selector: 'app-shared-best-seller',
  standalone: true,
  imports: [
    TranslateModule,
    CustomTranslatePipe,
    PercentPipe,
    AsyncPipe,
    RouterLink,
    ImageUrlDirective,
    SafeHtmlComponent,
  ],
  templateUrl: './shared-best-seller.component.html',
  styleUrl: './shared-best-seller.component.css',
})
export class SharedBestSellerComponent implements OnInit {
  private _wishlistService = inject(WishlistService);

  private _authService = inject(AuthService);

  private _router = inject(Router);

  private _languageService = inject(LanguageService);

  private _alertService = inject(AlertService);

  readonly _cartStateService = inject(CartStateService); // Make it available to computed

  private userId = inject(AuthService).getUserId();

  productsInWishlist = this._wishlistService.getProductsInWishlistSignal();

  isAddingToWishlist = signal(false);

  isInWishlist = signal(false);

  currentLang$ = this._languageService.getLanguage();

  @Input({ required: true }) productData!: IAllProduct | BestProduct;

  ngOnInit(): void {
    if (this._authService.isAuthenticated()) {
      if (this.userId) {
        if (this.productData) {
          this.checkIfProductInWishlist();
        }
      }
    }
  }

  /* Cart */

  private setCartLoading(loading: boolean): void {
    if (!this.productData?.id) return;
    cartLoadingMap.set(this.productData.id, loading);
  }

  /**
   * Check if the product is in the cart
   * @returns Boolean indicating whether the product is in the cart
   */
  isInCart(): boolean {
    if (!this.productData?.id) return false;
    return this._cartStateService.isProductInCart(this.productData.id);
  }

  toggleCart(): void {
    if (this.isInCart()) {
      this.removeFromCart();
    } else {
      this.addToCart();
    }
  }

  removeFromCart(): void {
    if (!this.isInCart() || !this.productData?.id) return;

    if (this.isAddingToCart()) return;

    // Get the cart item detail for this product
    const cartItem = this._cartStateService.getCartItemForProduct(
      this.productData.id
    );
    if (!cartItem) return;

    this.setCartLoading(true);

    // Show confirmation alert before removing
    this._alertService.showConfirmation({
      imagePath: '/images/common/before-remove.png',
      translationKeys: {
        title: 'alerts.cart.remove_confirm.title',
        message: 'alerts.cart.remove_confirm.message',
        confirmText: 'alerts.cart.remove_confirm.yes',
        cancelText: 'alerts.cart.remove_confirm.cancel',
      },
      onConfirm: () => {
        // Proceed with removal
        this.executeRemoveFromCart(cartItem.id);
      },
      onCancel: () => {
        this.setCartLoading(false);
      },
    });
  }

  private executeRemoveFromCart(detailId: number): void {
    this._cartStateService.removeItem(detailId).subscribe({
      next: () => {
        this.setCartLoading(false);

        // Refresh the cart state
        this._cartStateService.fetchCart();

        // Show success notification (without buttons)
        this._alertService.showNotification({
          imagePath: '/images/common/remove.gif',
          translationKeys: {
            title: 'alerts.cart.remove_success.title',
          },
        });
      },
      error: (err) => {
        this.setCartLoading(false);
        if (err.status === 401) {
          this._languageService
            .getLanguage()
            .pipe(take(1))
            .subscribe((lang) => {
              this._router.navigate(['/', lang, 'login']);
            });
        }

        // Show error notification
        this._alertService.showNotification({
          imagePath: '/images/common/before-remove.png',
          translationKeys: {
            title: 'alerts.cart.remove_error.title',
            message: 'alerts.cart.remove_error.message',
          },
        });
        console.error('Error removing from cart:', err);
      },
    });
  }

  addToCart(): void {
    if (this.isAddingToCart() || !this.productData?.id) {
      if (!this.productData?.id) console.error('Product data or ID missing');
      return;
    }

    if (!this._authService.isAuthenticated()) {
      this._languageService
        .getLanguage()
        .pipe(take(1))
        .subscribe((lang: string) => {
          this._router.navigate(['/', lang, 'login']);
        });
      return;
    }

    this.setCartLoading(true);
    this.addNewItemToCart();
  }

  isAddingToCart(): boolean {
    return cartLoadingMap.get(this.productData.id) || false;
  }

  private addNewItemToCart(): void {
    if (!this.productData?.id) return; // Guard again
    const formData = new FormData();
    formData.append('product_id', this.productData.id.toString());
    formData.append('quantity', '1');
    // if (this.userId) formData.append('user_id', this.userId.toString()); // API might need user_id

    this._cartStateService.addToCart(formData).subscribe({
      next: () => {
        this.setCartLoading(false);
        // No need to manually set isInCart, computed signal handles it.
        this.showAddToCartSuccessAlert();
      },
      error: (error) => {
        this.setCartLoading(false);
        this.handleCartError(error);
      },
    });
  }

  private handleCartError(error: any): void {
    if (error.status === 401) {
      this._languageService
        .getLanguage()
        .pipe(take(1))
        .subscribe((lang: string) => {
          this._router.navigate(['/', lang, 'login']);
        });
    }
    console.error('Cart operation error:', error);
  }

  private showAddToCartSuccessAlert(): void {
    if (!this.productData) return;

    // Show success notification for adding to cart
    this._alertService.showNotification({
      imagePath: '/images/common/addtocart.gif',
      translationKeys: {
        title: 'alerts.cart.add_success.title',
      },
    });
  }

  /* Wishlist */

  toggleWishlist(): void {
    if (this.isInWishlist()) {
      this.removeFromWishlist();
    } else {
      this.addToWishlist();
    }
  }

  addToWishlist(): void {
    if (this.isInWishlist() || this.isAddingToWishlist()) return;
    if (!this.productData?.id || !this.userId) {
      if (!this.userId) {
        this._languageService
          .getLanguage()
          .pipe(take(1))
          .subscribe((lang) => {
            this._router.navigate(['/', lang, 'login']);
          });
      }
      return;
    }
    this.isAddingToWishlist.set(true);
    this._wishlistService.addToWishlist(this.productData.id).subscribe({
      next: () => {
        this.isInWishlist.set(true);
        this.isAddingToWishlist.set(false);
        this._wishlistService.loadWishlistCount();

        // Show success notification alert (no buttons)
        this._alertService.showNotification({
          imagePath: '/images/common/wishlist.gif',
          translationKeys: {
            title: 'alerts.wishlist.add_success.title',
          },
        });
      },
      error: (err) => {
        this.isAddingToWishlist.set(false);
        if (err.status === 401) {
          this._languageService
            .getLanguage()
            .pipe(take(1))
            .subscribe((lang) => {
              this._router.navigate(['/', lang, 'login']);
            });
        }

        // Show error notification
        this._alertService.showNotification({
          imagePath: '/images/common/before-remove.png',
          translationKeys: {
            title: 'alerts.remove_error.title',
            message: 'alerts.remove_error.message',
          },
        });
        console.error('Error adding to wishlist:', err);
      },
    });
  }

  removeFromWishlist(): void {
    if (!this.isInWishlist() || !this.productData?.id) return;
    const wishId = this._wishlistService.getWishIdForProduct(
      this.productData.id
    );
    if (!wishId) return;

    // Show confirmation alert before removing
    this._alertService.showConfirmation({
      imagePath: '/images/common/before-remove.png',
      translationKeys: {
        title: 'alerts.wishlist.remove_confirm.title',
        message: 'alerts.wishlist.remove_confirm.message',
        confirmText: 'alerts.wishlist.remove_confirm.yes',
        cancelText: 'alerts.wishlist.remove_confirm.cancel',
      },
      onConfirm: () => {
        // Proceed with removal
        this.productsInWishlist().forEach((item) => {
          // console.log(item);
        });
        this.executeRemoveFromWishlist(wishId);
      },
    });
  }

  private checkIfProductInWishlist(): void {
    if (!this.productData || !this.productData.id) return;
    const isInWishlist = this._wishlistService.isProductInWishlist(
      this.productData.id
    );
    this.isInWishlist.set(isInWishlist);
  }

  // Actual removal from wishlist after confirmation
  private executeRemoveFromWishlist(wishId: number): void {
    this.isAddingToWishlist.set(true);

    this._wishlistService.removeFromWishlist(wishId).subscribe({
      next: () => {
        this.isInWishlist.set(false);
        this.isAddingToWishlist.set(false);
        this._wishlistService.loadWishlistCount();

        // Show success notification (without buttons)
        this._alertService.showNotification({
          imagePath: '/images/common/remove.gif',
          translationKeys: {
            title: 'alerts.wishlist.remove_success.title',
          },
        });
      },
      error: (err) => {
        this.isAddingToWishlist.set(false);
        if (err.status === 401) {
          this._languageService
            .getLanguage()
            .pipe(take(1))
            .subscribe((lang) => {
              this._router.navigate(['/', lang, 'login']);
            });
        }

        // Show error notification
        this._alertService.showNotification({
          imagePath: '/images/common/before-remove.png',
          translationKeys: {
            title: 'alerts.wishlist.remove_error.title',
            message: 'alerts.wishlist.remove_error.message',
          },
        });
        console.error('Error removing from wishlist:', err);
      },
    });
  }
}
