import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  Input,
  OnInit,
  PLATFORM_ID,
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
export class HeroComponent implements OnInit, AfterViewInit {
  @Input() heroSection: Slider[] = [];
  @ViewChild('owlCarousel') owlCarousel!: CarouselComponent;

  private platformId = inject(PLATFORM_ID);
  private languageService = inject(LanguageService);
  private isBrowser = isPlatformBrowser(this.platformId);
  private currentLanguage: string = 'en';

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
    autoHeight: false,
    items: 1,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    margin: 0,
    smartSpeed: 800,
    center: true,
    stagePadding: 0,
    rewind: false,
    slideTransition: 'fade',
    animateIn: 'fadeIn',
    animateOut: 'fadeOut',
    lazyLoad: true,
    rtl: false,
    navText: [
      '<i class="fa fa-chevron-left"></i>',
      '<i class="fa fa-chevron-right"></i>',
    ],
    responsive: {
      0: {
        items: 1,
        nav: true,
      },
      768: {
        items: 1,
        nav: true,
      },
    },
    nav: true,
  };

  ngOnInit(): void {
    // Subscribe to language changes to update RTL setting
    if (this.isBrowser) {
      this.languageService.getLanguage().subscribe((lang) => {
        this.currentLanguage = lang;
        this.customOptions = {
          ...this.customOptions,
          rtl: lang === 'ar',
        };

        // Give time for DOM to update and then remove any duplicate dots
        setTimeout(() => {
          this.fixDuplicatedDots();
        }, 100);
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // Fix carousel after it's fully initialized
      setTimeout(() => {
        this.fixDuplicatedDots();
        this.ensureNavigationArrowsVisible();
        this.enhanceLoopTransition();
      }, 300);
    }
  }

  private fixDuplicatedDots(): void {
    if (typeof document !== 'undefined') {
      const dotsContainers = document.querySelectorAll('.owl-dots');
      // Hide all but the first dots container
      for (let i = 1; i < dotsContainers.length; i++) {
        (dotsContainers[i] as HTMLElement).style.display = 'none';
      }
    }
  }

  private ensureNavigationArrowsVisible(): void {
    if (typeof document !== 'undefined') {
      const navButtons = document.querySelectorAll('.owl-nav button');
      navButtons.forEach((btn: Element) => {
        (btn as HTMLElement).style.visibility = 'visible';
        (btn as HTMLElement).style.opacity = '1';
      });
    }
  }

  private enhanceLoopTransition(): void {
    if (typeof document !== 'undefined') {
      // Add class to help with custom looping animation
      const carouselElement = document.querySelector('.owl-carousel');
      if (carouselElement) {
        carouselElement.classList.add('enhanced-loop');

        // Monitor for slide change to manage cloned slides appearance
        const observer = new MutationObserver((mutations) => {
          const owlStage = document.querySelector('.owl-stage');
          if (owlStage) {
            const clonedItems = document.querySelectorAll('.owl-item.cloned');
            clonedItems.forEach((item: Element) => {
              // Adjust opacity transition timing when changing from last to first
              (item as HTMLElement).style.transition = 'opacity 0.8s ease';
            });
          }
        });

        observer.observe(carouselElement, {
          childList: true,
          subtree: true,
          attributes: true,
        });
      }
    }
  }
}
