import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { WhoWeAreSharedComponent } from '../../shared/components/who-we-are-shared/who-we-are-shared.component';
import { BestSellerComponent } from './components/best-seller/best-seller.component';
import { HeroComponent } from './components/hero/hero.component';
import { NewArticlsComponent } from './components/new-articls/new-articls.component';
import { NewProductsComponent } from './components/new-products/new-products.component';
import { OfferCardComponent } from './components/offer-card/offer-card.component';
import { OfferDayComponent } from './components/offer-day/offer-day.component';
import { SectionsComponent } from './components/sections/sections.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    SectionsComponent,
    BannerComponent,
    OfferCardComponent,
    BestSellerComponent,
    OfferDayComponent,
    NewArticlsComponent,
    NewProductsComponent,
    WhoWeAreSharedComponent,
    TranslateModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
