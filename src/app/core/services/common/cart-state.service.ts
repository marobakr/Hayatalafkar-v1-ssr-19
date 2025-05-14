import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, tap } from 'rxjs';
import { CartItem, CartResponse } from '../../models/order.model';
import { OrdersService } from './orders.service';

@Injectable({
  providedIn: 'root',
})
export class CartStateService {
  private ordersService = inject(OrdersService);

  // Cart state signals
  private cartState = signal<CartResponse | null>(null);

  // Public computed signals
  readonly items = computed(() => this.cartState()?.items || []);
  readonly subtotal = computed(() => this.cartState()?.subtotal || 0);
  readonly total = computed(() => this.cartState()?.total || 0);
  readonly tax = computed(() => this.cartState()?.tax || 0);
  readonly shipping = computed(() => this.cartState()?.shipping || 0);
  readonly discount = computed(() => this.cartState()?.discount || 0);
  readonly itemCount = computed(() => {
    const items = this.items();
    return items.reduce((count, item) => count + item.quantity, 0);
  });
  readonly isEmpty = computed(() => this.items().length === 0);

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
        takeUntilDestroyed(),
        tap((cart) => this.cartState.set(cart)),
        catchError((err) => {
          console.error('Error fetching cart', err);
          return EMPTY;
        })
      )
      .subscribe();
  }

  addToCart(item: CartItem) {
    return this.ordersService.addToCartOrCreateOrder(item).pipe(
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
