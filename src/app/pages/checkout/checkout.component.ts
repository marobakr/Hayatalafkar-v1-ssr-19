import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { IAddress } from '@core/interfaces/user.interface';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { LanguageService } from '@core/services/lang/language.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { NotificationComponent } from '@shared/components/notification/notification.component';
import { Observable } from 'rxjs';
import { ArticlesHeaderComponent } from '../articles/components/articles-header/articles-header.component';
import { CheckoutAddressComponent } from './components/checkout-address/checkout-address.component';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    LoadingComponent,
    RouterLink,
    RouterOutlet,
    CheckoutAddressComponent,
    OrderSummaryComponent,
    NotificationComponent,
    ArticlesHeaderComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  private _cartStateService = inject(CartStateService);
  private _notificationService = inject(NotificationService);
  private _router = inject(Router);
  languageService = inject(LanguageService);

  // Use signals from cart state
  order = this._cartStateService.order;
  orderDetails = this._cartStateService.orderDetails;
  loading = false;

  // Observable for current language
  currentLang$: Observable<string> = this.languageService.getLanguage();

  // Selected address for shipping
  selectedAddress: IAddress | null = null;

  ngOnInit(): void {
    this.checkCartItems();
    this.redirectToFirstStep();
  }

  /**
   * Check if cart has items before proceeding with checkout
   */
  private checkCartItems(): void {
    if (!this.orderDetails() || this.orderDetails().length === 0) {
      this._notificationService.warning(
        'checkout.cart_empty',
        'checkout.warning'
      );
      this.languageService.getLanguage().subscribe((lang) => {
        this._router.navigate(['/', lang, 'cart']);
      });
    }
  }

  /**
   * Redirect to the first step if on the base checkout route
   */
  private redirectToFirstStep(): void {
    // If we're on the base checkout route, redirect to the first step
    if (this._router.url.endsWith('/checkout')) {
      this.languageService.getLanguage().subscribe((lang) => {
        this._router.navigate(['/', lang, 'checkout', 'checkout-address']);
      });
    }
  }

  /**
   * Check if a given route is active
   */
  isActiveRoute(route: string): boolean {
    return this._router.url.includes(route);
  }

  /**
   * Handle address selection from the address component
   */
  onAddressSelected(address: IAddress): void {
    this.selectedAddress = address;
    if (address) {
      this._notificationService.success(
        'checkout.address_selected',
        'checkout.success'
      );
    }
  }

  /**
   * Navigate to the next step
   */
  goToNextStep(currentStep: string): void {
    this.languageService.getLanguage().subscribe((lang) => {
      if (currentStep === 'checkout-address') {
        this._router.navigate(['/', lang, 'checkout', 'order-summary']);
      } else if (currentStep === 'order-summary') {
        this._router.navigate(['/', lang, 'checkout', 'payment']);
      }
    });
  }
}
