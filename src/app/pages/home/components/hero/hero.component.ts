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
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { SafeHtmlComponent } from '@core/safe-html/safe-html.component';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { SloganComponent } from '@shared/components/slogan/slogan.component';
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
        autoplay:
          this.heroSection.length > 1
            ? {
                delay: 5000,
                disableOnInteraction: false,
              }
            : false,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
      });

      // Add click handlers to custom navigation buttons
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          this.swiper?.slidePrev();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          this.swiper?.slideNext();
        });
      }
    } catch (error) {
      console.error('Error initializing Swiper:', error);
    }
  }
}
