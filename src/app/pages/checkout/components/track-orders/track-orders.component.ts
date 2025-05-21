import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
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
  ],
  templateUrl: './track-orders.component.html',
  styleUrls: ['./track-orders.component.css'],
})
export class TrackOrdersComponent implements OnInit {
  private _userService = inject(UserService);
  private _destroyRef = inject(DestroyRef);

  orderDetails = signal<ILastOrderResponse | null>(null);
  loading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.getOrderDetails();
  }

  getOrderDetails(): void {
    this.loading.set(true);
    this._userService
      .getUserLastOrder()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response: ILastOrderResponse) => {
          this.loading.set(false);
          if (response && response.order) {
            this.orderDetails.set(response);
            console.log('Order details fetched successfully:', response);
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
}
