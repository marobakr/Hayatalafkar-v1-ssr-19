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
import { UserService } from '../user/user.service';
import { OrdersService } from './orders.service';

@Injectable({
  providedIn: 'root',
})
export class CartStateService {
  private ordersService = inject(OrdersService);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  // Cart state signals
  private cartState = signal<IGetCartOrOrder>({} as IGetCartOrOrder);

  // Public computed signals
  readonly order = computed(() => this.cartState().order);

  readonly orderDetails = computed(() => this.cartState()?.orderDetails || []);

  readonly promoCode = computed(() => this.cartState()?.promocode || null);

  readonly user = computed(() => this.cartState()?.user || null);

  readonly isEmpty = computed(() => this.orderDetails().length === 0);

  /**
   * Get the total number of items in the cart
   */
  readonly cartCount = computed(() => {
    // Return 0 if user is not authenticated
    if (!this.authService.isAuthenticated()) {
      return 0;
    }

    // Don't calculate cart count if there are no confirmed orders
    const hasConfirmedOrders = this.hasConfirmedOrders();
    if (!hasConfirmedOrders) {
      return 0;
    }

    const items = this.orderDetails();
    if (!items || items.length === 0) return 0;

    // Sum up the quantities of all items
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  });

  // Signal to track if user has confirmed orders
  private hasConfirmedOrdersSignal = signal<boolean>(false);

  // Method to check if user has confirmed orders
  private hasConfirmedOrders(): boolean {
    console.log(this.hasConfirmedOrdersSignal());
    return this.hasConfirmedOrdersSignal();
  }

  constructor() {
    // Check for confirmed orders first
    this.checkConfirmedOrders();

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

  // Check if the user has confirmed orders
  checkConfirmedOrders(): void {
    if (!this.authService.isAuthenticated()) {
      this.hasConfirmedOrdersSignal.set(false);
      return;
    }

    // Use ordersService.checkCart() to get current cart items
    this.ordersService.checkCart().subscribe({
      next: (response) => {
        // Check if response has orderDetails and if it has items
        const hasItems =
          response &&
          response.orderDetails &&
          Array.isArray(response.orderDetails) &&
          response.orderDetails.length > 0;

        console.log('Cart has items:', hasItems);
        this.hasConfirmedOrdersSignal.set(hasItems);
      },
      error: (err) => {
        console.error('Error checking cart items:', err);
        this.hasConfirmedOrdersSignal.set(false);
      },
    });
  }

  fetchCart() {
    // Don't fetch cart for unauthenticated users
    if (!this.authService.isAuthenticated()) {
      // Initialize with empty cart
      this.cartState.set({
        orderDetails: [],
        promocode: null,
        order: null as any,
        user: null as any,
      });
      return;
    }

    // Don't fetch cart if user has no confirmed orders
    if (!this.hasConfirmedOrders()) {
      // Initialize with empty cart
      this.cartState.set({
        orderDetails: [],
        promocode: null,
        order: null as any,
        user: null as any,
      });
      return;
    }

    this.ordersService
      .checkCart()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((cart) => {
          this.cartState.set(cart);
        }),
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
    // console.log(productId);
    const orderDetails = this.orderDetails();
    if (!orderDetails || orderDetails.length === 0) {
      return false;
    }

    // Convert to string for comparison to handle both number and string types
    const searchProductId = productId.toString();
    // Find product in cart by ID
    // console.log(
    //   orderDetails.some(
    //     (item) => item.product_id.toString() === searchProductId
    //   )
    // );
    // console.log(searchProductId);
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
    // Prevent adding to cart if user is not authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('User must be authenticated to add items to cart');
      return EMPTY;
    }

    const userId = this.authService.getUserId();
    return this.ordersService.addToCartOrCreateOrder(item, userId).pipe(
      tap((response: any) => {
        // Set hasConfirmedOrders to true since we just added an item
        this.hasConfirmedOrdersSignal.set(true);

        // Ensure the response has the expected structure
        let formattedCart: IGetCartOrOrder;

        // Check if the response is already in the expected format
        if (response.orderDetails && Array.isArray(response.orderDetails)) {
          formattedCart = response as IGetCartOrOrder;
        }
        // If response has a different structure like { cart: { details: [...] } }
        else if (response.cart && response.cart.details) {
          formattedCart = {
            orderDetails: response.cart.details,
            order: response.cart.order || (null as any),
            promocode: response.cart.promocode || null,
            user: response.cart.user || (null as any),
          };
        }
        // If we can't determine the structure, use the response as is
        else {
          console.warn('Unexpected cart response structure:', response);
          formattedCart = response as IGetCartOrOrder;
        }

        // Set the cart state with the formatted response
        this.cartState.set(formattedCart);
      }),
      catchError((err) => {
        console.error('Error adding item to cart', err);
        return EMPTY;
      })
    );
  }

  /**
   * Update quantity of an item in the cart
   */
  updateQuantity(productId: string | number, quantity: number) {
    // Prevent updating cart if user is not authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('User must be authenticated to update cart');
      return EMPTY;
    }

    const item = {
      productId: productId,
      quantity: quantity,
    };

    return this.ordersService.updateQuantity(item).pipe(
      tap((cart) => this.cartState.set(cart)),
      catchError((err) => {
        console.error('Error updating cart quantity', err);
        return EMPTY;
      })
    );
  }

  removeItem(productId: string | number) {
    // Prevent removing items if user is not authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('User must be authenticated to remove items from cart');
      return EMPTY;
    }

    return this.ordersService.removeFromCart(productId).pipe(
      tap((cart) => this.cartState.set(cart)),
      catchError((err) => {
        console.error('Error removing item from cart', err);
        return EMPTY;
      })
    );
  }

  clearCart() {
    // Prevent clearing cart if user is not authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('User must be authenticated to clear cart');
      return EMPTY;
    }

    return this.ordersService.removeAllFromCart().pipe(
      tap((cart) => this.cartState.set(cart)),
      catchError((err) => {
        console.error('Error clearing cart', err);
        return EMPTY;
      })
    );
  }

  applyPromoCode(code: string) {
    // Prevent applying promo code if user is not authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('User must be authenticated to apply promo code');
      return EMPTY;
    }

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
