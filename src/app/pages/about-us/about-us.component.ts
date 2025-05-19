import { Component, inject, OnInit } from '@angular/core';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { API_CONFIG } from '@core/services/conf/api.config';
import { TranslateModule } from '@ngx-translate/core';
import { AboutSharedComponent } from '@shared/components/about-shared/about-shared.component';
import { BannerComponent } from '@shared/components/banner/banner.component';
import { BigCardOfferComponent } from '@shared/components/big-card-offer/big-card-offer.component';
import { CardComponent } from './components/card/card.component';
import { FAQComponent } from './components/faq/faq.component';
import { ServiceCardComponent } from './components/service-card/service-card.component';
import { IAboutUsOne, IAboutUsTwo } from './res/about-us.interface';
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
export class AboutUsComponent implements OnInit {
  aboutUsService = inject(AboutUsService);
  API_CONFIG = API_CONFIG.BASE_URL_IMAGE;

  aboutUsOne: IAboutUsOne = {
    counters: [],
    breaks: [],
    offers: [],
  };
  aboutUsTwo: IAboutUsTwo = {} as IAboutUsTwo;

  ngOnInit(): void {
    this.getAboutUs();
    this.getAboutData();
  }
  /* counters ,offers ,breaks*/
  getAboutUs() {
    this.aboutUsService.getAboutUs().subscribe((res: IAboutUsOne) => {
      this.aboutUsOne = res;
    });
  }

  /* aboutdata ,features , FAQS  */
  getAboutData() {
    this.aboutUsService.getAboutData().subscribe((res: IAboutUsTwo) => {
      this.aboutUsTwo = res;
    });
  }
}
