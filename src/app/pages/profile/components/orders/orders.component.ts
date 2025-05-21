import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { UserService } from '@core/services/user/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { IGetOrders, ILastOrderResponse } from './res/order.interface';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    LoadingComponent,
    ImageUrlDirective,
    CustomTranslatePipe,
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  private _userService = inject(UserService);
  private _destroyRef = inject(DestroyRef);
  private _router = inject(Router);

  // Create a subject that emits when navigation starts
  private _navigationStart = new Subject<void>();

  orders = signal<IGetOrders>({} as IGetOrders);
  lastOrder = signal<ILastOrderResponse | null>(null);
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
}
