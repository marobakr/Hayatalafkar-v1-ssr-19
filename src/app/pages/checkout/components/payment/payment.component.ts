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
   * Submit order with cash-on-delivery payment
   */
  placeOrder(): void {
    this.isSubmitting.set(true);

    this._ordersService.placeOrder(this.order().id).subscribe({
      next: (response: any) => {
        this.isSubmitting.set(false);
      },
      error: (error) => {
        this.isSubmitting.set(false);
      },
    });
  }
}
