import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
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
export class HomeComponent implements OnInit {
  constructor(private meta: Meta, private title: Title) {}

  ngOnInit() {
    // Set meta description
    this.meta.updateTag({
      name: 'description',
      content:
        'موقعك الأمثل للجمال ومستحضرات التجميل. نقدم لكِ أحدث مستحضرات التجميل من أفضل العلامات التجارية العالمية، إضافةً إلى نصائح حصرية للعناية بالبشرة والمكياج.',
    });

    // Add other relevant meta tags
    this.meta.updateTag({
      name: 'keywords',
      content:
        'مستحضرات تجميل, العناية بالبشرة, مكياج, عطور, منتجات تجميل, كوزمتكس',
    });

    this.meta.updateTag({
      property: 'og:title',
      content: 'COSMETICS - موقعك الأمثل للجمال ومستحضرات التجميل',
    });

    this.meta.updateTag({
      property: 'og:description',
      content:
        'اكتشفي تشكيلة واسعة من منتجات العناية بالبشرة والمكياج والعطور من أفضل الماركات العالمية',
    });

    // Set canonical URL
    this.meta.updateTag({
      property: 'og:url',
      content: 'https://iridescent-frangipane-90a1bc.netlify.app/ar/home',
    });

    // Set page title
    this.title.setTitle('COSMETICS - موقعك الأمثل للجمال ومستحضرات التجميل');
  }
}
