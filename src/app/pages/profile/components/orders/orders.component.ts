import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../../../core/services/user/user.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  private _userService = inject(UserService);
  private _destroyRef = inject(DestroyRef);

  orders = signal<any[]>([]);
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
        next: (response) => {
          this.loading.set(false);
          if (response && response.data) {
            this.orders.set(response.data);
          }
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error?.message || 'Error fetching orders');
          console.error('Error fetching orders:', error);
        },
      });
  }

  getLastOrder(): void {
    this.loading.set(true);
    this._userService
      .getUserLastOrder()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response && response.data) {
            // Here you might want to highlight the last order or scroll to it
            console.log('Last order:', response.data);
          }
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error?.message || 'Error fetching last order');
          console.error('Error fetching last order:', error);
        },
      });
  }
}
