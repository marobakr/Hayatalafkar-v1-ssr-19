import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router, RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { LanguageService } from '@core/services/lang/language.service';
import { UserService } from '@core/services/user/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { IGetOrders, ILastOrderResponse } from './res/order.interface';

interface OrderStatusConfig {
  textColor: string;
  bgColor: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    LoadingComponent,
    ImageUrlDirective,
    CustomTranslatePipe,
    AsyncPipe,
    RouterLink,
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  private _userService = inject(UserService);
  private _destroyRef = inject(DestroyRef);
  private _router = inject(Router);
  private currentLang$ = inject(LanguageService);
  private _cartState = inject(CartStateService);
  currentLang = this.currentLang$.getLanguage();

  private _navigationStart = new Subject<void>();

  orders = signal<IGetOrders>({} as IGetOrders);
  lastOrder = signal<ILastOrderResponse>({} as ILastOrderResponse);
  loading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    // Subscribe to navigation events to cancel pending requests
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(() => {
        // When navigation starts, emit to cancel pending requests
        this._navigationStart.next();
      });

    this.getUserOrders();
    this.getLastOrder();
  }

  getUserOrders(): void {
    this.loading.set(true);
    this._userService
      .getUserOrders()
      .pipe(
        // Complete the subscription when navigation starts OR component is destroyed
        takeUntil(this._navigationStart),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe({
        next: (response: IGetOrders) => {
          console.log('all users orders ', response);
          this.loading.set(false);
          if (response && response.row) {
            this.orders.set(response);
          }
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error?.message || 'Error fetching orders');
          console.error('Error fetching orders:', error);
        },
        complete: () => {
          // Ensure loading is turned off when the subscription completes
          this.loading.set(false);
        },
      });
  }

  getLastOrder(): void {
    this.loading.set(true);
    this._userService
      .getUserLastOrder()
      .pipe(
        // Complete the subscription when navigation starts OR component is destroyed
        takeUntil(this._navigationStart),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe({
        next: (response: ILastOrderResponse) => {
          this.loading.set(false);
          if (response && response.order) {
            this.lastOrder.set(response);
          }
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error?.message || 'Error fetching last order');
          console.error('Error fetching last order:', error);
        },
        complete: () => {
          // Ensure loading is turned off when the subscription completes
          this.loading.set(false);
        },
      });
  }

  getOrderStatusConfig(status: string): OrderStatusConfig {
    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case 'delivered':
        return {
          textColor: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: 'check-circle',
          label: 'Delivered',
        };
      case 'on the way':
        return {
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: 'truck',
          label: 'On The Way',
        };
      case 'confirmed':
        return {
          textColor: 'text-amber-600',
          bgColor: 'bg-amber-100',
          icon: 'clipboard-check',
          label: 'Confirmed',
        };
      case 'cancelled':
        return {
          textColor: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: 'x-circle',
          label: 'Cancelled',
        };
      case 'processing':
        return {
          textColor: 'text-purple-600',
          bgColor: 'bg-purple-100',
          icon: 'refresh',
          label: 'Processing',
        };
      default:
        return {
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: 'information-circle',
          label: status,
        };
    }
  }

  reorder(orderId: number): void {
    let lang = 'ar';
    this.currentLang$.getLanguage().subscribe((next) => {
      lang = next;
    });

    this._router.navigate(['/', lang, 'checkout', 'payment']);
  }

  addItemToCart(orderId: number): void {
    this._cartState.fetchCart().subscribe((response) => {
      console.log('cart ', response);
    });
  }
}
