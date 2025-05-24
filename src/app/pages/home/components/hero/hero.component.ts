import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  Input,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { SafeHtmlComponent } from '@core/safe-html/safe-html.component';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { SloganComponent } from '@shared/components/slogan/slogan.component';
import {
  CarouselComponent,
  CarouselModule,
  OwlOptions,
} from 'ngx-owl-carousel-o';
import { Subject } from 'rxjs';
import { Slider } from '../../res/home.interfaces';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    SloganComponent,
    TranslateModule,
    CustomTranslatePipe,
    SafeHtmlComponent,
    ImageUrlDirective,
    LoadingComponent,
    CarouselModule,
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  @Input() heroSection: Slider[] = [];
  @ViewChild('owlCarousel') owlCarousel!: CarouselComponent;

  private platformId = inject(PLATFORM_ID);
  private languageService = inject(LanguageService);
  private isBrowser = isPlatformBrowser(this.platformId);
  private currentLanguage: string = 'en';
  private destroy$ = new Subject<void>();
  private isCarouselInitialized = false;

  // Signal to track carousel loading state
  isCarouselLoading = signal(true);
  currentLang$ = this.languageService.getLanguage();

  // Configure owl carousel options
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    dotsEach: false,
    navSpeed: 700,
    autoHeight: true,
    items: 1,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    margin: 0,
    smartSpeed: 800,
    center: true,
    stagePadding: 0,
    rewind: false,
    slideTransition: 'ease',
    animateIn: 'slideInRight',
    animateOut: 'slideOutLeft',
    lazyLoad: false,
    rtl: false,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
        nav: false,
      },
      768: {
        items: 1,
        nav: false,
      },
    },
    nav: false,
  };
}
