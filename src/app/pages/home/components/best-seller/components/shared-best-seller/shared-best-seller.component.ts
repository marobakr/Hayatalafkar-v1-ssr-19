import { PercentPipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { FilterHtmlPipe } from '@core/pipes/filter-html.pipe';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { AuthService } from '@core/services/auth/auth.service';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { LanguageService } from '@core/services/lang/language.service';
import { WishlistService } from '@core/services/wishlist/wishlist.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
    FilterHtmlPipe,
    ImageUrlDirective,
    SafeHtmlComponent,
  ],
  templateUrl: './shared-best-seller.component.html',
  styleUrl: './shared-best-seller.component.css',
})
export class SharedBestSellerComponent implements OnInit {
  private _wishlistService = inject(WishlistService);

  private _translateService = inject(TranslateService);

  private _authService = inject(AuthService);

  private _router = inject(Router);

  private _languageService = inject(LanguageService);

  private _alertService = inject(AlertService);

  readonly _cartStateService = inject(CartStateService); // Make it available to computed

  private userId: number | null = null;

  isAddingToWishlist = signal(false);

  isInWishlist = signal(false);

  @Input({ required: true }) productData!: IAllProduct | BestProduct;

  // isInCart is now a computed signal, directly deriving its state from CartStateService
  readonly isInCart = computed(() => {
    if (!this.productData || !this.productData.id) {
      return false;
    }
    // Directly use the service method. Relies on productData.id being stable for this instance.
    return this._cartStateService.isProductInCart(this.productData.id);
  });

  constructor() {
    // Effect can be used for other reactions to productData changes if necessary,
    // but it's no longer responsible for syncing isInCart.
    effect(() => {
      const currentProductData = this.productData; // Capture current value for the effect
      if (currentProductData && currentProductData.id) {
        // Example: console.log(`Effect ran for product: ${currentProductData.id}`);
        // If productData itself can change for an existing component instance,
        // this effect will re-evaluate. The computed isInCart will also re-evaluate.
      }
    });
  }

  ngOnInit(): void {
    if (this._authService.isAuthenticated()) {
      const userData = this._authService.getUserData();
      if (userData && userData.id) {
        this.userId = userData.id;
        if (this.productData && this.productData.id) {
          this.checkIfProductInWishlist();
          // No need to call a method to check/set isInCart, computed signal handles it.
        }
      }
    }
  }

  private checkIfProductInWishlist(): void {
    if (!this.productData || !this.productData.id) return;
    const isInWishlist = this._wishlistService.isProductInWishlist(
      this.productData.id
    );
    this.isInWishlist.set(isInWishlist);
  }

  // isAddingToCart uses the module-level map for per-instance loading state
  isAddingToCart(): boolean {
    if (!this.productData || !this.productData.id) return false;
    return cartLoadingMap.get(this.productData.id) || false;
  }

  private setCartLoading(loading: boolean): void {
    if (!this.productData || !this.productData.id) return;
    if (loading) {
      cartLoadingMap.set(this.productData.id, true);
    } else {
      cartLoadingMap.delete(this.productData.id);
    }
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
    this._wishlistService
      .addToWishlist(this.productData.id, this.userId)
      .subscribe({
        next: () => {
          this.isInWishlist.set(true);
          this.isAddingToWishlist.set(false);
          this._wishlistService.loadWishlistCount();
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

    this.isAddingToWishlist.set(true);
    this._wishlistService.removeFromWishlist(wishId).subscribe({
      next: () => {
        this.isInWishlist.set(false);
        this.isAddingToWishlist.set(false);
        this._wishlistService.loadWishlistCount();
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
        console.error('Error removing from wishlist:', err);
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

    // Now `this.isInCart()` will provide the reactive, correct state.
    if (this.isInCart()) {
      const cartItem = this._cartStateService.getCartItemForProduct(
        this.productData.id
      );
      if (cartItem) {
        const newQuantity = cartItem.quantity + 1;
        this._cartStateService
          .updateQuantity(this.productData.id, newQuantity)
          .subscribe({
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
      } else {
        // This case should ideally not be reached if isInCart() is true
        // and getCartItemForProduct is consistent with isProductInCart
        console.warn(
          'Product was in cart, but no cart item found. Attempting to add as new.'
        );
        this.addNewItemToCart(); // Fallback to add new if item somehow missing
        // this.setCartLoading(false); // Or just stop if state is inconsistent
      }
    } else {
      this.addNewItemToCart();
    }
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
    const productName =
      this.productData.en_name || this.productData.ar_name || 'Product';
    this._translateService
      .get('shared.added_to_cart_success')
      .pipe(take(1))
      .subscribe(() => {
        this._alertService.show({
          title: this._translateService.instant('shared.success'),
          message: this._translateService.instant(
            'shared.added_to_cart_success'
          ),
          confirmText: this._translateService.instant(
            'shared.continue_shopping'
          ),
          cancelText: this._translateService.instant('shared.go_to_cart'),
          onConfirm: () => {},
          onCancel: () => {
            this._languageService
              .getLanguage()
              .pipe(take(1))
              .subscribe((lang: string) => {
                this._router.navigate(['/', lang, 'cart']);
              });
          },
        });
      });
  }
}
