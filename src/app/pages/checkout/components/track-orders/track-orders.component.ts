import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { SafeHtmlComponent } from '@core/safe-html/safe-html.component';
import { LanguageService } from '@core/services/lang/language.service';
import { UserService } from '@core/services/user/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ILastOrderResponse } from 'src/app/pages/profile/components/orders/res/order.interface';

@Component({
  selector: 'app-track-orders',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    LoadingComponent,
    ImageUrlDirective,
    AsyncPipe,
    RouterLink,
    CustomTranslatePipe,
    SafeHtmlComponent,
  ],
  templateUrl: './track-orders.component.html',
  styleUrls: ['./track-orders.component.css'],
})
export class TrackOrdersComponent implements OnInit {
  private _userService = inject(UserService);
  private _destroyRef = inject(DestroyRef);
  private _route = inject(ActivatedRoute);

  currentLang$ = inject(LanguageService).getLanguage();
  lastOrder = signal<ILastOrderResponse | null>(null);
  loading = signal(false);
  errorMessage = signal('');
  orderId = signal<string | null>(null);

  ngOnInit(): void {
    // Get order-id parameter from route if available
    this._route.paramMap
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((params) => {
        const orderIdParam = params.get('order-id');
        if (orderIdParam) {
          this.orderId.set(orderIdParam);
          this.getOrderById(orderIdParam);
        } else {
          this.getLastOrder();
        }
      });
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return d.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  formatEstimatedDate(date: string | undefined): string {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    // Add one day for estimated delivery
    d.setDate(d.getDate() + 1);

    return d.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  getOrderTime(offsetHours: number = 0): string {
    const orderTime = this.lastOrder()?.order?.order_time;
    if (!orderTime) return '';

    try {
      const hours = +orderTime.substring(0, 2);
      const minutes = orderTime.substring(3, 5);
      const newHours = (hours + offsetHours) % 24;
      const isPM = newHours >= 12;

      return `${newHours}:${minutes} ${isPM ? 'P.M' : 'A.M'}`;
    } catch (error) {
      return '';
    }
  }

  getOrderById(orderId: string): void {
    this.loading.set(true);
    this._userService
      .getUserOrderById(orderId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response: ILastOrderResponse) => {
          console.log(response);
          this.loading.set(false);
          if (response && response.order) {
            this.lastOrder.set(response);
          }
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(
            error?.message || 'Error fetching order details'
          );
          console.error('Error fetching order details:', error);
        },
      });
  }

  getLastOrder(): void {
    this.loading.set(true);
    this._userService
      .getUserLastOrder()
      .pipe(takeUntilDestroyed(this._destroyRef))
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

  getOrderStatusProgress(): number {
    const status = this.lastOrder()?.order?.order_status?.toLowerCase() || '';

    // Define order stages and their progress percentage based on the specified statuses
    const progressMap: Record<string, number> = {
      pending: 0, // Initial stage (0%)
      confirmed: 25, // Order confirmed (25%)
      processing: 25, // Same as confirmed (25%)
      preparation: 50, // In preparation (50%)
      'on the way': 75, // On the way (75%)
      shipping: 75, // Same as on the way (75%)
      delivered: 100, // Delivered (100%)
      completed: 100, // Same as delivered (100%)
    };

    // Return the progress percentage based on the status, default to 0 if status is not found
    return progressMap[status] || 0;
  }

  isStepActive(stepIndex: number): boolean {
    const progress = this.getOrderStatusProgress();

    // Define the progress thresholds for each step
    // Step 0: Order Submitted (0%)
    // Step 1: Confirmed/Approved (25%)
    // Step 2: In Preparation (50%)
    // Step 3: On The Way (75%)
    // Step 4: Delivered (100%)
    const stepThresholds = [0, 25, 50, 75, 100];

    // A step is active if the current order progress is equal to or greater than that step's threshold
    return progress >= stepThresholds[stepIndex];
  }
}
