import { AsyncPipe, PercentPipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { SafeHtmlComponent } from '@core/safe-html/safe-html.component';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { ArrowButtonComponent } from '@shared/components/arrow-button/arrow-button.component';
import { Offer, RandomProduct } from '../../res/home.interfaces';
@Component({
  selector: 'app-offer-day',
  standalone: true,
  imports: [
    TranslateModule,
    ArrowButtonComponent,
    PercentPipe,
    CustomTranslatePipe,
    SafeHtmlComponent,
    ImageUrlDirective,
    RouterLink,
    AsyncPipe,
  ],
  templateUrl: './offer-day.component.html',
  styleUrl: './offer-day.component.css',
})
export class OfferDayComponent {
  _languageService = inject(LanguageService);

  currentLang$ = this._languageService.getLanguage();

  isArabic = false;

  lang = this._languageService.getIsArabic().subscribe((isArabic) => {
    this.isArabic = isArabic;
  });

  @Input({ required: true }) randomProducts: RandomProduct[] = [];
  @Input({ required: true }) lastOffer: Offer = {} as Offer;
}
