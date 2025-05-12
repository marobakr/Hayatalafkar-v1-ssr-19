import { Component, inject } from '@angular/core';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { ArrowButtonComponent } from '../../shared/components/arrow-button/arrow-button.component';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { ServiceCardComponent } from '../about-us/components/service-card/service-card.component';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [
    TranslateModule,
    BannerComponent,
    ServiceCardComponent,
    ArrowButtonComponent,
  ],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent {
  _apiService = inject(ApiService);

  getContactUs() {
    this._apiService.get(API_CONFIG.STATIC_PAGES.ABOUT_US).subscribe((res) => {
      console.log(res);
    });
  }
  getImagePath(image: string): string {
    return this._apiService.getImageUrl(image, '');
  }
}
