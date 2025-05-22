import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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

  currentLang$ = inject(LanguageService).getLanguage();
  lastOrder = signal<ILastOrderResponse | null>(null);
  loading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.getLastOrder();
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

  getLastOrder(): void {
    this.loading.set(true);
    this._userService.getUserLastOrder().subscribe({
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
