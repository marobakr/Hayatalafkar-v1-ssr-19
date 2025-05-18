import { Component, Input } from '@angular/core';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BigCardOfferComponent } from '@shared/components/big-card-offer/big-card-offer.component';
import { Offer } from '../../res/home.interfaces';

@Component({
  selector: 'app-offer-card',
  standalone: true,
  imports: [BigCardOfferComponent, TranslateModule, CustomTranslatePipe],
  templateUrl: './offer-card.component.html',
  styleUrl: './offer-card.component.css',
})
export class OfferCardComponent {
  constructor(private _translate: TranslateService) {
    this._translate
      .get(`offers.bigCard.${0}.imagTitle`)
      .subscribe((titles: string[]) => {
        console.log(titles);
      });
  }

  @Input({ required: true }) offers: Offer[] = [];
}
