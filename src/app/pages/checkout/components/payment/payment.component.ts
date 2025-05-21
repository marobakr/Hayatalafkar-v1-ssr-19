import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IAddress } from '@core/interfaces/user.interface';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { API_CONFIG } from '@core/services/conf/api.config';
import { LanguageService } from '@core/services/lang/language.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { UserService } from '@core/services/user/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { OrderSummaryComponent } from '@shared/components/order-summary/order-summary.component';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    LoadingComponent,
    OrderSummaryComponent,
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  private _cartState = inject(CartStateService);
  private _notificationService = inject(NotificationService);
  private _destroyRef = inject(DestroyRef);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _userService = inject(UserService);
  private _http = inject(HttpClient);

  // State management
  isSubmitting = signal(false);

  // Data from cart state
  order = this._cartState.order;
  orderDetails = this._cartState.orderDetails;

  // Selected address ID passed from the address step
  selectedAddressId = signal<number | null>(null);
  selectedAddress = signal<IAddress | null>(null);

  // Observable for current language
  currentLang$: Observable<string> = this._languageService.getLanguage();

  ngOnInit(): void {
    this.getAddressIdFromRoute();
  }

  /**
   * Get address ID from route query params and fetch address details
   */
  getAddressIdFromRoute(): void {
    this._route.queryParamMap
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        switchMap((params) => {
          const addressId = params.get('address_id');
          if (addressId) {
            this.selectedAddressId.set(parseInt(addressId, 10));
            // Fetch the full address details
            return this._userService.getUserInfo();
          } else {
            // Redirect back to address step if no address ID is provided
            this._languageService.getLanguage().subscribe((lang) => {
              this._router.navigate([
                '/',
                lang,
                'checkout',
                'checkout-address',
              ]);
              this._notificationService.warning(
                'checkout.payment.no_address_selected',
                'checkout.payment.warning'
              );
            });
            throw new Error('No address ID provided');
          }
        })
      )
      .subscribe({
        next: (userInfo) => {
          if (userInfo && userInfo.row && userInfo.row.addresses) {
            const address = userInfo.row.addresses.find(
              (addr: IAddress) => addr.id === this.selectedAddressId()
            );
            if (address) {
              this.selectedAddress.set(address);
            }
          }
        },
        error: (error) => {
          console.error('Failed to fetch address', error);
        },
      });
  }

  /**
   * Submit order with cash-on-delivery payment
   */
  placeOrder(): void {
    if (!this.order() || !this.order().id) {
      this._notificationService.error(
        'checkout.payment.no_order',
        'checkout.payment.error'
      );
      return;
    }

    if (!this.selectedAddressId()) {
      this._notificationService.error(
        'checkout.payment.no_address_selected',
        'checkout.payment.error'
      );
      return;
    }

    this.isSubmitting.set(true);

    // Call the placeOrder endpoint with the order ID
    const orderId = this.order()!.id;
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ORDERS.PLACE_ORDER}${orderId}`;

    const formData = new FormData();
    // Since we've checked selectedAddressId is not null above, we can safely use the non-null assertion operator (!)
    formData.append('address_id', this.selectedAddressId()!.toString());
    formData.append('payment_method', 'cash_on_delivery');

    this._http
      .post(url, formData)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response: any) => {
          this.isSubmitting.set(false);
          this._notificationService.success(
            'checkout.payment.order_placed_success',
            'checkout.payment.success'
          );

          // Navigate to order confirmation
          this._languageService.getLanguage().subscribe((lang) => {
            this._router.navigate(['/', lang, 'profile', 'orders']);
          });
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this._notificationService.error(
            error?.error?.message || 'checkout.payment.order_placed_error',
            'checkout.payment.error'
          );
        },
      });
  }
}
