import { AsyncPipe, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IAddress } from '@core/interfaces/user.interface';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { OrdersService } from '@core/services/cart/orders.service';
import { LanguageService } from '@core/services/lang/language.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { UserService } from '@core/services/user/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { OrderSummaryComponent } from '@shared/components/order-summary/order-summary.component';
import { Observable } from 'rxjs';
import { ArticlesHeaderComponent } from '../../../articles/components/articles-header/articles-header.component';

export enum PaymentMethod {
  CASH_ON_DELIVERY = 1,
  ONLINE_PAYMENT = 2,
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    LoadingComponent,
    OrderSummaryComponent,
    ArticlesHeaderComponent,
    RouterLink,
    AsyncPipe,
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  private _cartState = inject(CartStateService);
  private _ordersService = inject(OrdersService);
  private _notificationService = inject(NotificationService);
  private _destroyRef = inject(DestroyRef);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _userService = inject(UserService);
  private _http = inject(HttpClient);

  // State management
  isSubmitting = signal(false);
  selectedPaymentMethod = signal<PaymentMethod | null>(null);

  // Payment method enum for template access
  PaymentMethod = PaymentMethod;

  // Track if we're navigating away to prevent unnecessary redirects
  private isNavigatingAway = false;

  // Data from cart state
  order = this._cartState.order;
  orderDetails = this._cartState.orderDetails;

  // Selected address ID passed from the address step
  selectedAddressId = signal<number | null>(null);
  selectedAddress = signal<IAddress | null>(null);

  // Observable for current language
  currentLang$: Observable<string> = this._languageService.getLanguage();

  ngOnInit(): void {}

  /**
   * Set the selected payment method
   */
  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod.set(method);
  }

  /**
   * Fetch address details from user info
   */
  private fetchAddressDetails(): void {
    if (!this.selectedAddressId()) return;

    this._userService
      .getUserInfo()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (userInfo) => {
          if (userInfo?.row?.addresses) {
            const address = userInfo.row.addresses.find(
              (addr: IAddress) => addr.id === this.selectedAddressId()
            );
            if (address) {
              this.selectedAddress.set(address);
            }
          }
        },
        error: (error) => {
          console.error('Failed to fetch address details:', error);
        },
      });
  }

  /**
   * Handle order placement based on payment method
   */
  handleOrderPlacement(): void {
    if (!this.selectedPaymentMethod()) {
      this._notificationService.error(
        'Payment Method Required',
        'Please select a payment method to continue'
      );
      return;
    }

    if (this.selectedPaymentMethod() === PaymentMethod.CASH_ON_DELIVERY) {
      this.placeOrder();
    } else if (this.selectedPaymentMethod() === PaymentMethod.ONLINE_PAYMENT) {
      this.redirectToPaymentGateway();
    }
  }

  /**
   * Submit order with cash-on-delivery payment
   */
  placeOrder(): void {
    this.isSubmitting.set(true);

    this._ordersService.placeOrder(this.order().id).subscribe({
      next: (response: any) => {
        this.isSubmitting.set(false);
        console.log(response);
        // Navigate to track order page with order ID
        let currentLang = 'en';
        this._languageService.getLanguage().subscribe((lang) => {
          currentLang = lang;
        });
        this._router.navigate([
          '/',
          currentLang,
          'checkout',
          'track-order',
          this.order().user_id,
        ]);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this._notificationService.error(
          'Order Error',
          'Failed to place your order. Please try again.'
        );
      },
    });
  }

  /**
   * Redirect to online payment gateway
   */
  redirectToPaymentGateway(): void {
    this.isSubmitting.set(true);

    // In a real implementation, you would likely call an API to create a payment session
    // and then redirect to the payment gateway URL

    // Simulate payment gateway redirect
    // setTimeout(() => {
    //   this.isSubmitting.set(false);
    //   // This is where you would redirect to an actual payment gateway
    //   window.location.href = `https://payment-gateway.example.com/pay?order_id=${
    //     this.order().id
    //   }`;
    // }, 1000);

    /*
    {
name
amount
email
mobile
order_id
}
    */

    // this._http.post(API_CONFIG.PAYMENT.CREATE_PAYMENT, {
    //       name: this.order().name,
    //       amount: this.order().total,
    //       email: this.order().email,
    //       mobile: this.order().phone,
    //       order_id: this.order().order_id,
    //     }).subscribe((res) => {
    //       console.log(res);
    //     });
  }
}
