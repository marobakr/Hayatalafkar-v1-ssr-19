import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { IQuotes } from '@core/interfaces/common.model';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { CommonService } from '@core/services/common/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { AboutSharedComponent } from '@shared/components/about-shared/about-shared.component';
import { BannerComponent } from '@shared/components/banner/banner.component';
import { RelatedBlogsComponent } from '../articles/components/related-blogs/related-blogs.component';
import { BestSellerComponent } from './components/best-seller/best-seller.component';
import { HeroComponent } from './components/hero/hero.component';
import { NewProductsComponent } from './components/new-products/new-products.component';
import { OfferCardComponent } from './components/offer-card/offer-card.component';
import { OfferDayComponent } from './components/offer-day/offer-day.component';
import { SectionsComponent } from './components/sections/sections.component';
import { AboutUs } from './res/home.interfaces';
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
  private homeService = inject(HomeService);
  private commonService = inject(CommonService);

  // Access cached data directly through signals
  private homeDataSignal = this.commonService.homeData;

  // Computed signals for derived data
  sliders = computed(() => this.homeDataSignal()?.sliders || []);
  aboutUs = computed(() => this.homeDataSignal()?.aboutUs || ({} as AboutUs));
  counters = computed(() => this.homeDataSignal()?.counters || []);
  categories = computed(() => this.homeDataSignal()?.categories || []);
  offers = computed(() => this.homeDataSignal()?.offers || []);
  latestProducts = computed(() => this.homeDataSignal()?.latestProducts || []);
  randomProducts = computed(() => this.homeDataSignal()?.randomProducts || []);
  quotes = computed(() => this.homeDataSignal()?.breaks || []);
  bestProducts = computed(() => this.homeDataSignal()?.bestProducts || []);
  latestBlogs = computed(() => this.homeDataSignal()?.latestBlogs || []);

  // Setup logger effect to monitor data changes
  constructor() {
    effect(() => {
      const data = this.homeDataSignal();
      if (data) {
        console.log('Home data updated in signal');
      }
    });
  }

  getQuoteById(id: number): IQuotes | undefined {
    return this.quotes()?.find((quote: IQuotes) => quote.id === id);
  }

  ngOnInit(): void {
    this.loadHomeData();
  }

  loadHomeData(): void {
    // This will either return cached data or fetch new data
    this.homeService.getHomeData().subscribe({
      error: (err) => {
        console.error('Failed to load home data:', err);
      },
    });
  }
}
