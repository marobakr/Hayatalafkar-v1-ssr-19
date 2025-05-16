import {
  DestroyRef,
  Injectable,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IGetCartOrOrder, OrderDetail } from '@core/interfaces/cart.interfaces';
import { EMPTY, catchError, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { OrdersService } from './orders.service';

@Injectable({
  providedIn: 'root',
})
export class CartStateService {
  private ordersService = inject(OrdersService);
  private destroyRef = inject(DestroyRef);
  private _authService = inject(AuthService);

  // Cart state signals
  private cartState = signal<IGetCartOrOrder | null>(null);

  // Public computed signals
  readonly order = computed(() => this.cartState()?.order || null);
  readonly orderDetails = computed(() => this.cartState()?.orderDetails || []);
  readonly subtotal = computed(() => this.order()?.subtotal || '0');
  readonly total = computed(() => this.order()?.total || '0');
  readonly tax = computed(() => this.order()?.tax || '0');
  readonly shipping = computed(() => this.order()?.shipping || '0');
  readonly discount = computed(() => this.order()?.promo_code_value || '0');
  readonly itemCount = computed(() => {
    return this.orderDetails().reduce(
      (count: number, item: OrderDetail) => count + item.quantity,
      0
    );
  });
  readonly isEmpty = computed(() => this.orderDetails().length === 0);

  constructor() {
    // Initialize cart
    this.fetchCart();

    // Set up effect to automatically persist cart changes
    effect(() => {
      // This will trigger when the cart state changes
      const cart = this.cartState();
      if (cart) {
        localStorage.setItem('cart-timestamp', Date.now().toString());
      }
    });
  }

  fetchCart() {
    this.ordersService
      .checkCart()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((cart) => this.cartState.set(cart)),
        catchError((err) => {
          console.error('Error fetching cart', err);
          return EMPTY;
        })
      )
      .subscribe();
  }

  /**
   * Check if a product is already in the cart
   * @param productId The ID of the product to check
   * @returns boolean indicating whether the product is in the cart
   */
  isProductInCart(productId: number | string): boolean {
    const orderDetails = this.orderDetails();
    if (!orderDetails || orderDetails.length === 0) {
      return false;
    }

    // Convert to string for comparison to handle both number and string types
    const searchProductId = productId.toString();
    // Find product in cart by ID
    return orderDetails.some(
      (item) => item.product_id.toString() === searchProductId
    );
  }

  /**
   * Get the cart item details for a specific product
   * @param productId The ID of the product to find in the cart
   * @returns The cart item detail or null if not found
   */
  getCartItemForProduct(productId: number | string): OrderDetail | null {
    const orderDetails = this.orderDetails();
    if (!orderDetails || orderDetails.length === 0) {
      return null;
    }

    // Convert to string for comparison
    const searchProductId = productId.toString();

    // Find and return the cart item
    return (
      orderDetails.find(
        (item) => item.product_id.toString() === searchProductId
      ) || null
    );
  }

  addToCart(
    item:
      | FormData
      | {
          product_id: string | number;
          quantity: number;
          choice_id?: string;
        }
  ) {
    const userId = this._authService.getUserId();
    return this.ordersService.addToCartOrCreateOrder(item, userId).pipe(
      tap((cart) => this.cartState.set(cart)),
      catchError((err) => {
        console.error('Error adding item to cart', err);
        return EMPTY;
      })
    );
  }

  updateQuantity(productId: string | number, quantity: number) {
    return this.ordersService.updateQuantity({ productId, quantity }).pipe(
      tap((cart) => this.cartState.set(cart)),
      catchError((err) => {
        console.error('Error updating quantity', err);
        return EMPTY;
      })
    );
  }

  removeItem(productId: string | number) {
    return this.ordersService.removeFromCart(productId).pipe(
      tap((cart) => this.cartState.set(cart)),
      catchError((err) => {
        console.error('Error removing item from cart', err);
        return EMPTY;
      })
    );
  }

  clearCart() {
    return this.ordersService.removeAllFromCart().pipe(
      tap((cart) => this.cartState.set(cart)),
      catchError((err) => {
        console.error('Error clearing cart', err);
        return EMPTY;
      })
    );
  }

  applyPromoCode(code: string) {
    return this.ordersService.checkPromoCode(code).pipe(
      tap((response) => {
        if (response.valid && this.cartState()) {
          this.fetchCart(); // Refetch cart to get updated totals
        }
      }),
      catchError((err) => {
        console.error('Error applying promo code', err);
        return EMPTY;
      })
    );
  }
}
/*
<app-articles-header
  [title]="'cart.header.title' | translate"
  [subTitle]="'cart.header.subtitle' | translate"
  [showRotateImage]="false"
  [marginBottom]="'9'"
></app-articles-header>

<section>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-8">Shopping Cart</h1>

    @if (_cartState.isEmpty()) {
    <div class="bg-white rounded-lg shadow-md p-8 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 mx-auto text-gray-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <h2 class="text-xl font-semibold mb-2">Your cart is empty</h2>
      <p class="text-gray-600 mb-6">
        Looks like you haven't added any products to your cart yet.
      </p>
      <a
        [routerLink]="['/', currentLang$ | async, 'shopping']"
        class="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition duration-150 ease-in-out"
      >
        Continue Shopping
      </a>
    </div>
    } @else {
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Cart Items -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-4 border-b flex justify-between items-center">
            <h2 class="text-lg font-semibold">
              Items ({{ _cartState.itemCount() }})
            </h2>
            <button
              (click)="clearCart()"
              class="text-red-500 hover:text-red-700 text-sm font-medium"
              aria-label="Remove all items"
            >
              Remove all
            </button>
          </div>

          @for (item of _cartState.orderDetails(); track item.product_id) {
          <div class="p-4 border-b flex flex-col sm:flex-row gap-4">
            <!-- Product Image -->
            <div
              class="w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0"
            >
              @if (item.product?.main_image) {
              <img
                [appImageUrl]="item.product.main_image"
                [imageEndpoint]="''"
                [alt]="item.product | customTranslate : 'name'"
                class="w-full h-full object-cover"
              />
              } @else {
              <div
                class="w-full h-full bg-gray-200 flex items-center justify-center"
              >
                <span class="text-gray-400 text-xs">No image</span>
              </div>
              }
            </div>

            <!-- Product Details -->
            <div class="flex-1">
              <h3 class="text-lg font-medium mb-1">
                {{ item.product | customTranslate : "name" }}
              </h3>
              <p class="text-gray-500 text-sm mb-2">
                ${{ formatPrice(item.unit_price) }}
              </p>

              <!-- Quantity Controls -->
              <div class="flex items-center mt-2">
                <button
                  (click)="updateQuantity(item.product_id, item.quantity - 1)"
                  class="bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-l-md px-3 py-1"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span class="px-4 py-1 bg-gray-50 text-center w-12">{{
                  item.quantity
                }}</span>
                <button
                  (click)="updateQuantity(item.product_id, item.quantity + 1)"
                  class="bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-r-md px-3 py-1"
                  aria-label="Increase quantity"
                >
                  +
                </button>

                <button
                  (click)="removeItem(item.product_id)"
                  class="ml-4 text-red-500 hover:text-red-700"
                  aria-label="Remove item"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Price -->
            <div class="text-right">
              <p class="text-lg font-semibold">
                ${{ formatPrice(calculateItemTotal(item)) }}
              </p>
            </div>
          </div>
          }
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-md p-6 sticky top-4">
          <h2 class="text-lg font-semibold mb-4">Order Summary</h2>

          <!-- Promo Code -->
          <form
            [formGroup]="promoCodeForm"
            (ngSubmit)="applyPromoCode()"
            class="mb-6"
          >
            <div class="flex flex-col space-y-2 mb-2">
              <label for="promo-code" class="text-sm font-medium text-gray-700"
                >Promo Code</label
              >
              <div class="flex">
                <input
                  type="text"
                  id="promo-code"
                  formControlName="code"
                  class="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter code"
                />
                <button
                  type="submit"
                  [disabled]="!promoCodeForm.valid"
                  class="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-dark transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>

            @if (promoCodeError) {
            <p class="text-sm text-red-500 mt-1">{{ promoCodeError }}</p>
            } @if (promoCodeSuccess) {
            <p class="text-sm text-green-500 mt-1">{{ promoCodeSuccess }}</p>
            }
          </form>

          <!-- Summary Items -->
          <div class="space-y-3 border-b pb-4 mb-4">
            <div class="flex justify-between">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-medium"
                >${{ formatPrice(_cartState.subtotal()) }}</span
              >
            </div>

            @if (_cartState.discount() !== '0') {
            <div class="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-${{ formatPrice(_cartState.discount()) }}</span>
            </div>
            } @if (_cartState.tax() !== '0') {
            <div class="flex justify-between">
              <span class="text-gray-600">Tax</span>
              <span class="font-medium"
                >${{ formatPrice(_cartState.tax()) }}</span
              >
            </div>
            } @if (_cartState.shipping() !== '0') {
            <div class="flex justify-between">
              <span class="text-gray-600">Shipping</span>
              <span class="font-medium"
                >${{ formatPrice(_cartState.shipping()) }}</span
              >
            </div>
            }
          </div>

          <!-- Total -->
          <div class="flex justify-between items-center mb-6">
            <span class="text-lg font-bold">Total</span>
            <span class="text-xl font-bold"
              >${{ formatPrice(_cartState.total()) }}</span
            >
          </div>

          <!-- Checkout Button -->
          <a
            routerLink="/checkout"
            class="block w-full bg-primary text-white text-center py-3 rounded-md hover:bg-primary-dark transition duration-150 ease-in-out"
          >
            Proceed to Checkout
          </a>

          <!-- Continue Shopping -->
          <a
            routerLink="/products"
            class="block w-full text-center text-gray-600 hover:text-gray-900 mt-4"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
    }
  </div>
</section>


*/
