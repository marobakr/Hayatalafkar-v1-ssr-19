import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/service/lang/language.service';
import { ArrowButtonComponent } from '../../../../shared/components/arrow-button/arrow-button.component';

@Component({
  selector: 'app-offer-day',
  standalone: true,
  imports: [TranslateModule, ArrowButtonComponent],
  templateUrl: './offer-day.component.html',
  styleUrl: './offer-day.component.css',
})
export class OfferDayComponent {
  _languageService = inject(LanguageService);
}
