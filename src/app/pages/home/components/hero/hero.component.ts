import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  SimpleChanges,
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
import { takeUntil } from 'rxjs/operators';
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
export class HeroComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
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
    autoHeight: false,
    items: 1,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: false,
    margin: 0,
    smartSpeed: 1000,
    center: true,
    stagePadding: 0,
    rewind: false,
    slideTransition: 'linear',
    animateIn: 'fadeIn',
    animateOut: 'fadeOut',
    lazyLoad: true,
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

  ngOnInit(): void {
    // Subscribe to language changes to update RTL setting
    if (this.isBrowser) {
      this.languageService
        .getLanguage()
        .pipe(takeUntil(this.destroy$))
        .subscribe((lang) => {
          this.currentLanguage = lang;
          this.customOptions = {
            ...this.customOptions,
            rtl: lang === 'ar',
          };

          if (this.isCarouselInitialized && this.owlCarousel) {
            this.resetCarousel();
          }
        });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['heroSection'] && !changes['heroSection'].firstChange) {
      if (this.isBrowser && this.owlCarousel) {
        // Reset the carousel when slider data changes
        this.isCarouselLoading.set(true);
        this.resetCarousel();
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // Set loading state to true while carousel initializes
      this.isCarouselLoading.set(true);

      // Fix carousel after it's fully initialized
      setTimeout(() => {
        this.isCarouselInitialized = true;
        this.fixDuplicatedDots();
        this.hideNavigationArrows();
        this.setupCarouselEventListeners();

        // Subscribe to carousel initialized event
        if (this.owlCarousel) {
          this.owlCarousel.initialized
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              // Set loading to false when carousel is fully initialized
              setTimeout(() => {
                this.isCarouselLoading.set(false);
              }, 300);
            });
        } else {
          // If owlCarousel is not available for some reason, still hide loading
          setTimeout(() => {
            this.isCarouselLoading.set(false);
          }, 500);
        }
      }, 300);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Remove any observers
    if (this.isBrowser && typeof document !== 'undefined') {
      const carouselElement = document.querySelector('.owl-carousel');
      if (carouselElement && (carouselElement as any)._observer) {
        (carouselElement as any)._observer.disconnect();
      }
    }
  }

  private resetCarousel(): void {
    // Set loading to true while resetting
    this.isCarouselLoading.set(true);

    // Give time for DOM to update with new data
    setTimeout(() => {
      if (this.owlCarousel) {
        // Update the carousel configuration
        this.owlCarousel.options = { ...this.customOptions };

        // Force refresh by triggering carousel refresh
        const carouselElement = document.querySelector(
          '.owl-carousel'
        ) as HTMLElement;
        if (carouselElement) {
          // Remove and readd a class to force a refresh
          carouselElement.classList.remove('owl-loaded');
          setTimeout(() => {
            carouselElement.classList.add('owl-loaded');
            this.fixDuplicatedDots();
            this.fixClonedSlides();

            // Set loading to false after reset is complete
            setTimeout(() => {
              this.isCarouselLoading.set(false);
            }, 300);
          }, 50);
        }
      }
    }, 50);
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

  private hideNavigationArrows(): void {
    if (typeof document !== 'undefined') {
      const navContainer = document.querySelector('.owl-nav');
      if (navContainer) {
        (navContainer as HTMLElement).style.display = 'none';
      }
    }
  }

  private setupCarouselEventListeners(): void {
    if (typeof document !== 'undefined') {
      const carouselElement = document.querySelector('.owl-carousel');
      if (carouselElement) {
        carouselElement.classList.add('enhanced-loop');

        // Listen for carousel initialization and translate events
        if (this.owlCarousel) {
          this.owlCarousel.translated
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.fixClonedSlides();
            });

          this.owlCarousel.initialized
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.fixClonedSlides();
            });
        }
      }
    }
  }

  private fixClonedSlides(): void {
    if (typeof document !== 'undefined') {
      const clonedItems = document.querySelectorAll('.owl-item.cloned');
      const activeItems = document.querySelectorAll('.owl-item.active');

      // Make sure only one item is visible at a time
      activeItems.forEach((item, index) => {
        if (index > 0) {
          (item as HTMLElement).style.opacity = '0';
          (item as HTMLElement).style.visibility = 'hidden';
        } else {
          (item as HTMLElement).style.opacity = '1';
          (item as HTMLElement).style.visibility = 'visible';
        }
      });

      // Make cloned items invisible
      clonedItems.forEach((item) => {
        (item as HTMLElement).style.opacity = '0';
        (item as HTMLElement).style.visibility = 'hidden';
      });
    }
  }
}
