import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { API_CONFIG } from '@core/services/conf/api.config';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { AboutSharedComponent } from '@shared/components/about-shared/about-shared.component';
import { BannerComponent } from '@shared/components/banner/banner.component';
import { BigCardOfferComponent } from '@shared/components/big-card-offer/big-card-offer.component';
import { AboutSkeletonComponent } from '@shared/components/skeleton/about-skeleton/about-skeleton.component';
import { forkJoin } from 'rxjs';
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
    RouterLink,
    AsyncPipe,
    AboutSkeletonComponent,
  ],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css',
})
export class AboutUsComponent implements OnInit {
  aboutUsService = inject(AboutUsService);
  languageService = inject(LanguageService);

  currentLang$ = this.languageService.getLanguage();

  API_CONFIG = API_CONFIG.BASE_URL_IMAGE;

  isLoading = true;

  aboutUsOne: IAboutUsOne = {
    counters: [],
    breaks: [],
    offers: [],
  };

  // Initialize with default values to prevent undefined errors
  aboutUsTwo: IAboutUsTwo = {
    faqs: [],
    features: [],
    aboutdata: {
      id: 0,
      en_meta_title: '',
      ar_meta_title: '',
      en_meta_text: '',
      ar_meta_text: '',
      main_image: '',
      active_status: 0,
      en_footer_for_text: '',
      ar_footer_for_text: '',
      en_mission_text: '',
      ar_mission_text: '',
      en_vision_text: '',
      ar_vision_text: '',
      en_main_title: '',
      ar_main_title: '',
      en_main_text: '',
      ar_main_text: '',
      created_at: '',
      updated_at: '',
    },
  };

  ngOnInit(): void {
    this.loadAllData();
  }

  private loadAllData() {
    // Use forkJoin to load both requests in parallel
    forkJoin({
      aboutUs: this.aboutUsService.getAboutUs(),
      aboutData: this.aboutUsService.getAboutData(),
    }).subscribe({
      next: (result) => {
        this.aboutUsOne = result.aboutUs;
        this.aboutUsTwo = result.aboutData;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
