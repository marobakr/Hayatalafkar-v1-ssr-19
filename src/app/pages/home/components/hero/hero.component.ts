import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { SafeHtmlComponent } from '@core/safe-html/safe-html.component';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { SloganComponent } from '@shared/components/slogan/slogan.component';
import { Subscription } from 'rxjs';
import { Slider } from '../../res/home.interfaces';
// Add Window interface extension for Swiper
declare global {
  interface Window {
    Swiper: any;
  }
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    SloganComponent,
    TranslateModule,
    CustomTranslatePipe,
    SafeHtmlComponent,
    ImageUrlDirective,
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @Input() heroSection: Slider[] = [];
  @ViewChild('swiperContainer') swiperContainer?: ElementRef;

  private platformId = inject(PLATFORM_ID);
  private languageService = inject(LanguageService);
  private ngZone = inject(NgZone);
  private swiper: any;
  private initTimeout?: number;
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private langSubscription?: Subscription;

  currentLang$ = this.languageService.getLanguage();

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return; // Skip initialization during SSR
    }

    // Initialize Swiper after the view is initialized
    this.ngZone.runOutsideAngular(() => {
      // Add a slight delay to ensure DOM is fully rendered
      this.initTimeout = window.setTimeout(() => {
        this.initializeSwiper();
      }, 500);
    });

    // Subscribe to language changes to reinitialize Swiper
    this.langSubscription = this.languageService.getLanguage().subscribe(() => {
      this.ngZone.runOutsideAngular(() => {
        // Destroy existing Swiper instance if it exists
        if (this.swiper) {
          try {
            this.swiper.destroy(true, true);
            this.swiper = null;
          } catch (error) {
            console.error('Error destroying Swiper instance:', error);
          }
        }

        // Delay initialization to ensure DOM is updated after language change
        window.setTimeout(() => {
          this.initializeSwiper();
        }, 300);
      });
    });
  }

  ngOnDestroy(): void {
    // Clear any pending timeouts
    if (this.initTimeout) {
      window.clearTimeout(this.initTimeout);
    }

    // Clean up Swiper instance
    if (this.swiper) {
      try {
        this.swiper.destroy(true, true);
      } catch (error) {
        console.error('Error destroying Swiper instance:', error);
      }
    }

    // Unsubscribe from language changes
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  private async initializeSwiper(): Promise<void> {
    try {
      // Check if the container exists
      if (!this.swiperContainer?.nativeElement) {
        console.warn('Swiper container not found in DOM');
        return;
      }

      // Add swiper class to the container element
      this.swiperContainer.nativeElement.classList.add('swiper');

      // Load Swiper CSS first
      await this.loadSwipeCSS();

      // Then load and initialize Swiper
      await this.loadSwiperScript();
    } catch (error) {
      console.error('Failed to initialize Swiper:', error);
    }
  }

  private loadSwipeCSS(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isBrowser) {
        resolve(); // Resolve immediately during SSR
        return;
      }

      // Check if CSS is already loaded
      if (document.querySelector('link[href*="swiper-bundle.min.css"]')) {
        resolve();
        return;
      }

      const swiperCss = document.createElement('link');
      swiperCss.rel = 'stylesheet';
      swiperCss.href =
        'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
      swiperCss.onload = () => resolve();
      document.head.appendChild(swiperCss);
    });
  }

  private loadSwiperScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser) {
        resolve(); // Resolve immediately during SSR
        return;
      }

      // Check if script is already loaded
      if (window && 'Swiper' in window) {
        this.initSwiperInstance();
        resolve();
        return;
      }

      const swiperScript = document.createElement('script');
      swiperScript.src =
        'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
      swiperScript.async = true;

      swiperScript.onload = () => {
        this.initSwiperInstance();
        resolve();
      };

      swiperScript.onerror = (error) => {
        console.error('Failed to load Swiper script:', error);
        reject(error);
      };

      document.head.appendChild(swiperScript);
    });
  }

  private initSwiperInstance(): void {
    try {
      // Get container element
      const swiperElement = this.swiperContainer?.nativeElement;
      if (!swiperElement) return;

      // Set up event listeners for custom navigation buttons
      const prevBtn = document.querySelector('.custom-swiper-button-prev');
      const nextBtn = document.querySelector('.custom-swiper-button-next');

      // Create Swiper instance
      this.swiper = new window.Swiper(swiperElement, {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: this.heroSection.length > 1,
        direction: 'horizontal',
        // Reverse the direction
        reverseDirection: true,
        autoplay:
          this.heroSection.length > 1
            ? {
                delay: 5000,
                disableOnInteraction: false,
              }
            : false,
        // Remove default navigation and use custom buttons only
        navigation: false,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
      });

      // Add click handlers to custom navigation buttons
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          // With reverseDirection, we need to slide next for prev button
          // to maintain correct navigation direction
          this.swiper?.slideNext();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          // With reverseDirection, we need to slide prev for next button
          // to maintain correct navigation direction
          this.swiper?.slidePrev();
        });
      }
    } catch (error) {
      console.error('Error initializing Swiper:', error);
    }
  }
}
