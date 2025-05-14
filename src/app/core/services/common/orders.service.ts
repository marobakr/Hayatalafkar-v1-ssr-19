import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CartItem,
  CartResponse,
  OrderRequest,
  OrderResponse,
  PromoCodeResponse,
} from '../../models/order.model';
import { API_CONFIG } from '../conf/api.config';
import { ApiService } from '../conf/api.service';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private api = inject(ApiService);

  /**
   * Check cart status
   */
  checkCart(): Observable<CartResponse> {
    return this.api.get<CartResponse>(API_CONFIG.ORDERS.CHECK_CART);
  }

  /**
   * Add item to cart or create new order
   */
  addToCartOrCreateOrder(item: CartItem): Observable<CartResponse> {
    return this.api.post<CartResponse>(
      API_CONFIG.ORDERS.ADD_TO_CART_OR_CREATE_ORDER,
      item
    );
  }

  /**
   * Update item quantity in cart
   */
  updateQuantity(item: {
    productId: string | number;
    quantity: number;
  }): Observable<CartResponse> {
    return this.api.post<CartResponse>(API_CONFIG.ORDERS.UPDATE_QUANTITY, item);
  }

  /**
   * Remove item from cart
   */
  removeFromCart(productId: string | number): Observable<CartResponse> {
    return this.api.post<CartResponse>(API_CONFIG.ORDERS.REMOVE_FROM_CART, {
      productId,
    });
  }

  /**
   * Remove all items from cart
   */
  removeAllFromCart(): Observable<CartResponse> {
    return this.api.post<CartResponse>(API_CONFIG.ORDERS.REMOVE_ALL, {});
  }

  /**
   * Apply promo code
   */
  checkPromoCode(code: string): Observable<PromoCodeResponse> {
    return this.api.post<PromoCodeResponse>(API_CONFIG.ORDERS.PROMO_CODE, {
      code,
    });
  }

  /**
   * Place order
   */
  placeOrder(orderData: OrderRequest): Observable<OrderResponse> {
    return this.api.post<OrderResponse>(
      API_CONFIG.ORDERS.PLACE_ORDER,
      orderData
    );
  }
}
