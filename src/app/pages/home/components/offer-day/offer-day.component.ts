import { Component, inject, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/lang/language.service';
import { ArrowButtonComponent } from '../../../../shared/components/arrow-button/arrow-button.component';
import { RandomProduct } from '../../res/home.interfaces';

@Component({
  selector: 'app-offer-day',
  standalone: true,
  imports: [TranslateModule, ArrowButtonComponent],
  templateUrl: './offer-day.component.html',
  styleUrl: './offer-day.component.css',
})
export class OfferDayComponent {
  _languageService = inject(LanguageService);

  @Input({ required: true }) randomProducts: RandomProduct[] = [];
}
