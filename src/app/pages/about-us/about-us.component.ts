import { Component, inject } from '@angular/core';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { API_CONFIG } from '@core/services/conf/api.config';
import { TranslateModule } from '@ngx-translate/core';
import { AboutSharedComponent } from '@shared/components/about-shared/about-shared.component';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { BigCardOfferComponent } from '../../shared/components/big-card-offer/big-card-offer.component';
import { CardComponent } from './components/card/card.component';
import { FAQComponent } from './components/faq/faq.component';
import { ServiceCardComponent } from './components/service-card/service-card.component';
import { IAboutUs } from './res/about-us.interface';
import { AboutUsService } from './res/about-us.service';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [
    AboutSharedComponent,
    CardComponent,
    BannerComponent,
    ServiceCardComponent,
    BigCardOfferComponent,
    FAQComponent,
    TranslateModule,
    CustomTranslatePipe,
  ],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css',
})
export class AboutUsComponent {
  aboutUsService = inject(AboutUsService);
  API_CONFIG = API_CONFIG.BASE_URL_IMAGE;
  aboutUs: IAboutUs = {} as IAboutUs;
  ngOnInit(): void {
    this.getAboutUs();
  }

  getAboutUs() {
    this.aboutUsService.getAboutUs().subscribe((res: IAboutUs) => {
      this.aboutUs = res;
    });
  }
}
