import { Component, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AboutSharedComponent } from '../../shared/components/about-shared/about-shared.component';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { BestSellerComponent } from './components/best-seller/best-seller.component';
import { HeroComponent } from './components/hero/hero.component';
import { NewArticlsComponent } from './components/new-articls/new-articls.component';
import { NewProductsComponent } from './components/new-products/new-products.component';
import { OfferCardComponent } from './components/offer-card/offer-card.component';
import { OfferDayComponent } from './components/offer-day/offer-day.component';
import { SectionsComponent } from './components/sections/sections.component';
import { IHome } from './res/home.interfaces';
import { HomeService } from './res/home.service';
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
    AboutSharedComponent,
    TranslateModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  homeService = inject(HomeService);

  homeData: IHome = {} as IHome;

  ngOnInit(): void {
    this.getHomeData();
  }

  getHomeData() {
    this.homeService.getHomeData().subscribe({
      next: (response: any) => {
        this.homeData = response;
        console.log(response);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
