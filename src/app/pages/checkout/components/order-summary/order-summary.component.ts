import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IAddress } from '@core/interfaces/user.interface';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { LanguageService } from '@core/services/lang/language.service';
import { NotificationService } from '@core/services/notification/notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonComponent,
    LoadingComponent,
    RouterLink,
  ],
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css'],
})
export class OrderSummaryComponent implements OnInit, OnChanges {
  @Input() selectedAddress: IAddress | null = null;
  @Output() proceedToNextStep = new EventEmitter<void>();

  private _cartStateService = inject(CartStateService);
  private _notificationService = inject(NotificationService);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _translateService = inject(TranslateService);
  private _destroyRef = inject(DestroyRef);

  // Use signals from cart state
  order = this._cartStateService.order;
  orderDetails = this._cartStateService.orderDetails;
  loading = false;

  // Order summary specific data
  taxAmount = 0;
  deliveryFee = 0;
  promoCode = '';

  ngOnInit(): void {
    // Calculate tax and delivery fee based on location if an address is selected
    this.updateShippingCosts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When selectedAddress changes, update shipping costs
    if (changes['selectedAddress']) {
      this.updateShippingCosts();
    }
  }

  /**
   * Get the current language
   */
  currentLang(): string {
    return this._translateService.currentLang || 'en';
  }

  updateShippingCosts(): void {
    if (this.selectedAddress) {
      // Example calculation - would be replaced with actual calculation based on location
      const locationId = this.selectedAddress.location_id;
      this.calculateLocationBasedCosts(locationId);
    } else {
      // Default values if no address selected
      this.taxAmount = 0;
      this.deliveryFee = 0;
    }
  }

  private calculateLocationBasedCosts(locationId: number): void {
    // This would be replaced with a real API call to get location-based pricing
    // For now, we'll just use a simple calculation
    this.taxAmount = this.getSubtotal() * 0.05; // 5% tax

    // Delivery fee based on location ID (just an example)
    this.deliveryFee = locationId % 5 === 0 ? 0 : 30; // Free shipping for some locations
  }

  getSubtotal(): number {
    const subtotal = this.order()?.subtotal
      ? parseFloat(this.order().subtotal)
      : this.calculateSubtotalFromItems();
    return subtotal;
  }

  private calculateSubtotalFromItems(): number {
    let subtotal = 0;
    const details = this.orderDetails();
    if (details && details.length > 0) {
      subtotal = details.reduce((total, item) => {
        return total + (parseFloat(item.subtotal) || 0);
      }, 0);
    }
    return subtotal;
  }

  getTotal(): number {
    return this.getSubtotal() + this.taxAmount + this.deliveryFee;
  }

  formatPrice(price: any): string {
    if (!price) return '0';

    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  }

  applyPromoCode(): void {
    if (!this.promoCode.trim()) {
      this._notificationService.warning(
        'checkout.enter_promo_code',
        'checkout.warning'
      );
      return;
    }

    // Simulate promo code application - would be replaced with API call
    this._notificationService.info(
      'checkout.applying_promo_code',
      'checkout.info'
    );

    // Simulate API delay
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this._notificationService.success(
        'checkout.promo_code_applied',
        'checkout.success'
      );
    }, 1000);
  }

  proceedToPayment(): void {
    if (!this.selectedAddress) {
      this._notificationService.warning(
        'checkout.select_address',
        'checkout.warning'
      );
      return;
    }

    // Emit event to parent component
    this.proceedToNextStep.emit();

    // Show notification
    this._translateService
      .get('checkout.proceeding_to_payment')
      .subscribe((msg) => {
        this._notificationService.info(msg, 'checkout.info');
      });

    // Navigate to payment page
    this._languageService
      .getLanguage()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((lang) => {
        this._router.navigate(['/', lang, 'checkout', 'payment']);
      });
  }
}
