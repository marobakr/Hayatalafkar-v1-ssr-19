import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, inject, OnInit } from '@angular/core';
import { ICategory, IQuotes } from '@core/interfaces/common.model';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { AboutSharedComponent } from '@shared/components/about-shared/about-shared.component';
import { BannerComponent } from '@shared/components/banner/banner.component';
import { RelatedBlogsComponent } from '../articles/components/related-blogs/related-blogs.component';
import { IRelatedBlogs } from '../articles/res/interfaces/singleBlog';
import { BestSellerComponent } from './components/best-seller/best-seller.component';
import { HeroComponent } from './components/hero/hero.component';
import { NewProductsComponent } from './components/new-products/new-products.component';
import { OfferCardComponent } from './components/offer-card/offer-card.component';
import { OfferDayComponent } from './components/offer-day/offer-day.component';
import { SectionsComponent } from './components/sections/sections.component';
import {
  AboutUs,
  BestProduct,
  Counter,
  LatestProduct,
  Offer,
  Slider,
} from './res/home.interfaces';
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
    NewProductsComponent,
    AboutSharedComponent,
    TranslateModule,
    RelatedBlogsComponent,
    CustomTranslatePipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('sectionAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(
          '500ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('staggerAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('100ms', [
              animate(
                '400ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('bannerAnimation', [
      transition(':enter', [
        style({ opacity: 0, scale: 0.95 }),
        animate('600ms ease-out', style({ opacity: 1, scale: 1 })),
      ]),
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate(
          '500ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate(
          '500ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
  ],
  host: { ngSkipHydration: 'true' },
})
export class HomeComponent implements OnInit {
  _homeService = inject(HomeService);

  sliders: Slider[] = [];

  aboutUs: AboutUs = {} as AboutUs;

  counters: Counter[] = [];

  categories: ICategory[] = [];

  offers: Offer[] = [];

  latestProducts: LatestProduct[] = [];

  randomProducts: LatestProduct[] = [];

  quotes: IQuotes[] = [];

  bestProducts: BestProduct[] = [];

  latestBlogs: IRelatedBlogs[] = [];

  getQuoteById(id: number): IQuotes | undefined {
    return this.quotes?.find((quote) => quote.id === id);
  }

  ngOnInit(): void {
    this.getHomeData();
  }

  getHomeData() {
    this._homeService.getHomeData().subscribe({
      next: (response: any) => {
        const {
          sliders,
          aboutUs,
          counters,
          categories,
          offers,
          latestProducts,
          randomProducts,
          breaks,
          bestProducts,
          latestBlogs,
        } = response;

        this.sliders = sliders;
        this.aboutUs = aboutUs;
        this.counters = counters;
        this.categories = categories;
        this.offers = offers;
        this.latestProducts = latestProducts;
        this.randomProducts = randomProducts;
        this.quotes = breaks;
        this.bestProducts = bestProducts;
        this.latestBlogs = latestBlogs;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
