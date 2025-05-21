import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '@core/services/user/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ArticlesHeaderComponent } from '../articles/components/articles-header/articles-header.component';
import {
  IGetOrders,
  ILastOrderResponse,
} from '../profile/components/orders/res/order.interface';

@Component({
  selector: 'app-order-details',
  imports: [
    ArticlesHeaderComponent,
    TranslateModule,
    CommonModule,
    LoadingComponent,
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css',
})
export class OrderDetailsComponent {
  private _userService = inject(UserService);
  private _destroyRef = inject(DestroyRef);

  orders = signal<IGetOrders>({} as IGetOrders);
  lastOrder = signal<ILastOrderResponse | null>(null);
  loading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.getUserOrders();
  }

  getUserOrders(): void {
    this.loading.set(true);
    this._userService
      .getUserOrders()
      .pipe(takeUntilDestroyed(this._destroyRef))
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
      });
  }
}
