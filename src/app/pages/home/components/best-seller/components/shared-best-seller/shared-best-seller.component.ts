import { AsyncPipe, JsonPipe, PercentPipe } from '@angular/common';
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

// Global flag to track if wishlist items have been loaded
let globalWishlistLoaded = false;

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
    JsonPipe,
  ],
  templateUrl: './shared-best-seller.component.html',
  styleUrl: './shared-best-seller.component.css',
})
export class SharedBestSellerComponent implements OnInit {
  private _authService = inject(AuthService);

  private _router = inject(Router);

  private _languageService = inject(LanguageService);

  private _alertService = inject(AlertService);

  readonly _cartStateService = inject(CartStateService);

  private _wishlistService = inject(WishlistService);

  private userId = inject(AuthService).getUserId();

  currentLang$ = this._languageService.getLanguage();

  @Input({ required: true }) productData!: IAllProduct | BestProduct;

  ngOnInit(): void {
    if (this._authService.isAuthenticated() && this.userId) {
      this.checkIfProductInWishlist();
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

  /**
   * Check if the product is currently being added to cart
   */
  isAddingToCart(): boolean {
    return cartLoadingMap.get(this.productData?.id) || false;
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

        this.showSuccessAlert(
          '/images/common/remove.gif',
          'alerts.cart.remove_success.title'
        );
      },
      error: (err) => {
        this.setCartLoading(false);
        this.handleApiError(
          err,
          'alerts.cart.remove_error.title',
          'alerts.cart.remove_error.message'
        );
      },
    });
  }

  addToCart(): void {
    if (this.isAddingToCart() || !this.productData?.id) {
      if (!this.productData?.id) console.error('Product data or ID missing');
      return;
    }

    if (!this._authService.isAuthenticated()) {
      this.navigateToLogin();
      return;
    }

    this.setCartLoading(true);
    this.addNewItemToCart();
  }

  private addNewItemToCart(): void {
    if (!this.productData?.id) return;
    const formData = new FormData();
    formData.append('product_id', this.productData.id.toString());
    formData.append('quantity', '1');

    this._cartStateService.addToCart(formData).subscribe({
      next: () => {
        this.setCartLoading(false);
        this.showSuccessAlert(
          '/images/common/addtocart.gif',
          'alerts.cart.add_success.title'
        );
      },
      error: (error) => {
        this.setCartLoading(false);
        this.handleApiError(
          error,
          'alerts.cart.add_error.title',
          'alerts.cart.add_error.message'
        );
      },
    });
  }

  /* Wishlist */
  productsInWishlist = this._wishlistService.getProductsInWishlistSignal();

  isAddingToWishlist = signal(false);

  isInWishlist = signal(false);

  isLoading = signal(false);

  wishlistItems = signal<any[]>([]);

  // Avoid calling the API multiple times by checking global flag
  loadWishlistItems(): void {
    if (!this.userId) {
      return;
    }

    this.isLoading.set(true);

    // If wishlist already loaded globally, use cached data instead of another API call
    if (globalWishlistLoaded) {
      this.isLoading.set(false);
      this.checkIfProductInWishlist();
      return;
    }

    this._wishlistService.getWishlistItems().subscribe({
      next: (response) => {
        // Check different possible response formats
        if (response && Array.isArray(response.wishs)) {
          this.wishlistItems.set(response.wishs);

          // Update isInWishlist if productData is available
          if (this.productData?.id) {
            const isInList = response.wishs.some(
              (item: any) => item.product_id === this.productData.id
            );
            this.isInWishlist.set(isInList);
          }

          // Set global flag to prevent multiple API calls
          globalWishlistLoaded = true;
        } else {
          this.wishlistItems.set([]);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading wishlist items:', error);
        this.wishlistItems.set([]);
        this.isLoading.set(false);

        // If unauthorized, handle accordingly
        if (error.status === 401) {
          // Force a re-login if token is invalid
          this._authService.logout().subscribe();
        }
      },
    });
  }

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
        this.navigateToLogin();
      }
      return;
    }

    this.isAddingToWishlist.set(true);

    this._wishlistService.addToWishlist(this.productData.id).subscribe({
      next: () => {
        this.isInWishlist.set(true);
        this.isAddingToWishlist.set(false);
        this._wishlistService.loadWishlistCount();

        this.showSuccessAlert(
          '/images/common/wishlist.png',
          'alerts.wishlist.add_success.title'
        );
      },
      error: (err) => {
        this.isAddingToWishlist.set(false);
        this.handleApiError(
          err,
          'alerts.wishlist.add_error.title',
          'alerts.wishlist.add_error.message'
        );
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
        this.executeRemoveFromWishlist(wishId);
      },
    });
  }

  private checkIfProductInWishlist(): void {
    if (!this.productData || !this.productData.id) return;

    // Check directly against the map maintained by the service
    const isInWishlist = this._wishlistService.isProductInWishlist(
      this.productData.id
    );
    this.isInWishlist.set(isInWishlist);
  }

  private executeRemoveFromWishlist(wishId: number): void {
    this.isAddingToWishlist.set(true);

    this._wishlistService.removeFromWishlist(wishId).subscribe({
      next: () => {
        this.isInWishlist.set(false);
        this.isAddingToWishlist.set(false);
        this._wishlistService.loadWishlistCount();

        this.showSuccessAlert(
          '/images/common/remove.gif',
          'alerts.wishlist.remove_success.title'
        );
      },
      error: (err) => {
        this.isAddingToWishlist.set(false);
        this.handleApiError(
          err,
          'alerts.wishlist.remove_error.title',
          'alerts.wishlist.remove_error.message'
        );
      },
    });
  }

  /**
   * Handle API errors consistently across cart and wishlist operations
   */
  private handleApiError(
    error: any,
    titleKey: string,
    messageKey: string
  ): void {
    if (error.status === 401) {
      this.navigateToLogin();
    }

    // Show error notification
    this._alertService.showNotification({
      imagePath: '/images/common/before-remove.png',
      translationKeys: {
        title: titleKey,
        message: messageKey,
      },
    });
    console.error('API operation error:', error);
  }

  /**
   * Navigate to login page with current language
   */
  private navigateToLogin(): void {
    this._languageService
      .getLanguage()
      .pipe(take(1))
      .subscribe((lang: string) => {
        this._router.navigate(['/', lang, 'login']);
      });
  }

  /**
   * Show success alert with consistent formatting
   */
  private showSuccessAlert(imagePath: string, titleKey: string): void {
    this._alertService.showNotification({
      imagePath: imagePath,
      translationKeys: {
        title: titleKey,
      },
    });
  }
}
