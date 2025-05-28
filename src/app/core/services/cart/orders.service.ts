import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { IGetCartOrOrder } from '@core/interfaces/cart.interfaces';
import { AuthService } from '../auth/auth.service';
import { API_CONFIG } from '../conf/api.config';
import { ApiService } from '../conf/api.service';
@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private api = inject(ApiService);
  private authService = inject(AuthService);

  /**
   * Check cart status
   */
  checkCart(): Observable<IGetCartOrOrder> {
    const userId = this.authService.getUserId();
    console.log(userId);
    return this.api.get<IGetCartOrOrder>(
      `${API_CONFIG.ORDERS.CHECK_CART}${userId}`
    );
  }

  /**
   * Add item to cart or create new order
   */
  addToCartOrCreateOrder(
    item:
      | FormData
      | {
          product_id: string | number;
          quantity: number;
          choice_id?: string;
        },
    user_id: string
  ): Observable<IGetCartOrOrder> {
    let userId = user_id.toString();

    return this.api.post<IGetCartOrOrder>(
      `${API_CONFIG.ORDERS.ADD_TO_CART_OR_CREATE_ORDER}${userId}`,
      item
    );
  }

  /**
   * Update item quantity in cart
   */
  updateQuantity(item: {
    orderDetailId: string | number;
    quantity: number;
  }): Observable<IGetCartOrOrder> {
    console.log(item);
    const data = new FormData();
    data.append('quantity', item.quantity.toString());
    return this.api.post<IGetCartOrOrder>(
      `${API_CONFIG.ORDERS.UPDATE_QUANTITY}${item.orderDetailId}`,
      data
    );
  }

  /**
   * Remove item from cart
   */
  removeFromCart(detailId: string | number): Observable<IGetCartOrOrder> {
    return this.api.post<IGetCartOrOrder>(
      `${API_CONFIG.ORDERS.REMOVE_FROM_CART}${detailId}`,
      {}
    );
  }

  /**
   * Remove all items from cart
   */
  removeAllFromCart(orderId: string | number): Observable<IGetCartOrOrder> {
    return this.api.post<IGetCartOrOrder>(
      `${API_CONFIG.ORDERS.REMOVE_ALL}${orderId}`,
      {}
    );
  }

  /**
   * Apply promo code
   */

  checkPromoCode(code: string): Observable<any> {
    const formData = new FormData();
    formData.append('code', code);
    const userId = this.authService.getUserId();
    return this.api.post<any>(
      `${API_CONFIG.ORDERS.PROMO_CODE}/${userId}`,
      formData
    );
  }

  /* Checkout  */
  checkout(address_id: string, order_id: string): Observable<any> {
    const formData = new FormData();
    formData.append('address_id', address_id.toString());
    return this.api.post<any>(
      `${API_CONFIG.ORDERS.CHECKOUT}${order_id}`,
      formData
    );
  }

  /**
   * Place order
   */
  placeOrder(order_id: number): Observable<any> {
    return this.api.post<any>(
      `${API_CONFIG.ORDERS.PLACE_ORDER}${order_id}`,
      {}
    );
  }
}
