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

  ngOnInit(): void {
    // Subscribe to language changes to update RTL setting
    if (this.isBrowser) {
      // Log heroSection data to verify it's available
      console.log('Hero Section Data:', this.heroSection);

      this.languageService
        .getLanguage()
        .pipe(takeUntil(this.destroy$))
        .subscribe((lang) => {
          this.currentLanguage = lang;
          // Adjust animation direction based on language direction
          if (lang === 'ar') {
            this.customOptions = {
              ...this.customOptions,
              rtl: true,
              animateIn: 'slideInLeft',
              animateOut: 'slideOutRight',
            };
          } else {
            this.customOptions = {
              ...this.customOptions,
              rtl: false,
              animateIn: 'slideInRight',
              animateOut: 'slideOutLeft',
            };
          }

          if (this.isCarouselInitialized && this.owlCarousel) {
            this.resetCarousel();
          }
        });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['heroSection']) {
      // Log heroSection data when it changes
      console.log('Hero Section Changed:', this.heroSection);

      if (this.isBrowser && this.heroSection?.length > 0) {
        // Reset the carousel when slider data changes
        this.isCarouselLoading.set(true);

        // If owl carousel is already initialized
        if (this.owlCarousel) {
          this.resetCarousel();
        } else {
          // If owlCarousel is not yet initialized, hide loading after a delay
          setTimeout(() => {
            this.isCarouselLoading.set(false);
          }, 800);
        }
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // Set loading state to true while carousel initializes
      this.isCarouselLoading.set(true);

      // Log to verify component is initializing properly
      console.log(
        'AfterViewInit - Carousel Reference:',
        this.owlCarousel ? 'Available' : 'Not Available'
      );

      // Fix carousel after it's fully initialized
      setTimeout(() => {
        this.isCarouselInitialized = true;
        this.fixDuplicatedDots();
        this.hideNavigationArrows();
        this.setupCarouselEventListeners();

        // Subscribe to carousel initialized event
        if (this.owlCarousel) {
          console.log('Owl Carousel initialized in component');

          this.owlCarousel.initialized
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              console.log('Owl Carousel initialized event received');
              // Set loading to false when carousel is fully initialized
              setTimeout(() => {
                this.isCarouselLoading.set(false);
                this.fixClonedSlides();
              }, 300);
            });
        } else {
          // If owlCarousel is not available for some reason, still hide loading
          console.warn(
            'Owl Carousel reference not available after initialization'
          );
          setTimeout(() => {
            this.isCarouselLoading.set(false);
          }, 800);
        }
      }, 500); // Increased timeout for more reliable initialization
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
    console.log('Resetting carousel');

    // Give time for DOM to update with new data
    setTimeout(() => {
      if (this.owlCarousel) {
        // Update the carousel configuration
        this.owlCarousel.options = { ...this.customOptions };
        console.log('Applied new carousel options');

        // Force refresh by triggering carousel refresh
        const carouselElement = document.querySelector(
          '.owl-carousel'
        ) as HTMLElement;
        if (carouselElement) {
          // Use a more reliable approach to reset the carousel
          // First remove the owl-loaded class
          carouselElement.classList.remove('owl-loaded');

          setTimeout(() => {
            // Then add it back to force a reflow
            carouselElement.classList.add('owl-loaded');

            // Set new options
            if (this.owlCarousel) {
              this.owlCarousel.options = { ...this.customOptions };

              // Try to reset using available methods
              try {
                // Force DOM reflow
                void carouselElement.offsetWidth;

                // Clean up event listeners and recreate them
                this.setupCarouselEventListeners();
              } catch (error) {
                console.error('Error resetting carousel:', error);
              }
            }

            this.fixDuplicatedDots();
            this.fixClonedSlides();

            // Set loading to false after reset is complete
            setTimeout(() => {
              this.isCarouselLoading.set(false);
              console.log('Carousel reset complete');
            }, 300);
          }, 200);
        }
      }
    }, 200); // Increased timeout for more reliable reset
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
              console.log('Carousel translated event');
              this.fixClonedSlides();
            });

          this.owlCarousel.initialized
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              console.log('Carousel initialized event in setup');
              this.fixClonedSlides();
            });

          // Also listen for change event
          this.owlCarousel.change
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              console.log('Carousel change event');
              this.fixClonedSlides();
            });
        }
      }
    }
  }

  private fixClonedSlides(): void {
    if (typeof document !== 'undefined') {
      console.log('Fixing cloned slides');

      const clonedItems = document.querySelectorAll('.owl-item.cloned');
      const activeItems = document.querySelectorAll('.owl-item.active');
      console.log(
        `Found ${activeItems.length} active items and ${clonedItems.length} cloned items`
      );

      // Don't hide all items first - this can cause flickering
      // Instead, directly target the ones we want to hide/show

      // Make active items visible and non-active items invisible
      const allItems = document.querySelectorAll('.owl-item');
      allItems.forEach((item, index) => {
        const isActive = item.classList.contains('active');
        const isCloned = item.classList.contains('cloned');

        // Show only the first active item
        if (isActive && !isCloned) {
          (item as HTMLElement).style.opacity = '1';
          (item as HTMLElement).style.visibility = 'visible';
          console.log(
            `Making item ${index} visible - active: ${isActive}, cloned: ${isCloned}`
          );
        } else {
          (item as HTMLElement).style.opacity = '0';
          (item as HTMLElement).style.visibility = 'hidden';
        }
      });

      // Handle special case - if no items are visible, make the first one visible
      if (activeItems.length === 0 && allItems.length > 0) {
        console.log('No active items found, making the first item visible');
        const firstItem = allItems[0] as HTMLElement;
        firstItem.style.opacity = '1';
        firstItem.style.visibility = 'visible';
      }
    }
  }
}
