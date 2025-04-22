import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { BigCardOfferComponent } from '../../shared/components/big-card-offer/big-card-offer.component';
import { WhoWeAreSharedComponent } from '../../shared/components/who-we-are-shared/who-we-are-shared.component';
import { CardComponent } from './components/card/card.component';
import { FAQComponent } from './components/faq/faq.component';
import { ServiceCardComponent } from './components/service-card/service-card.component';

@Component({
  selector: 'app-who-we-are',
  standalone: true,
  imports: [
    WhoWeAreSharedComponent,
    CardComponent,
    BannerComponent,
    ServiceCardComponent,
    BigCardOfferComponent,
    FAQComponent,
    TranslateModule,
  ],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css',
})
export class WhoWeAreComponent {}
