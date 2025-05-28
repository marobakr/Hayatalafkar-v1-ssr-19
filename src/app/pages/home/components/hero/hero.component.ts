import { AsyncPipe, CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  HostBinding,
  inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { SafeHtmlComponent } from '@core/safe-html/safe-html.component';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { HeroSkeletonComponent } from '@shared/components/skeleton/hero-skeleton/hero-skeleton.component';
import { SloganComponent } from '@shared/components/slogan/slogan.component';
import {
  CarouselComponent,
  CarouselModule,
  OwlOptions,
} from 'ngx-owl-carousel-o';
import { Subscription } from 'rxjs';
import { Slider } from '../../res/home.interfaces';
import { HomeService } from '../../res/home.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    CarouselModule,
    CustomTranslatePipe,
    SafeHtmlComponent,
    SloganComponent,
    ImageUrlDirective,
    HeroSkeletonComponent,
    AsyncPipe,
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() heroSection: Slider[] = [];

  @ViewChild('owlCarousel') mainCarousel!: CarouselComponent;

  private platformId = inject(PLATFORM_ID);
  private languageService = inject(LanguageService);
  private homeService = inject(HomeService);
  private subscription = new Subscription();

  // Signal to track carousel loading state
  isCarouselLoading = signal(true);
  currentLang$ = this.languageService.getLanguage();
  isRtlMode = signal(false);

  @HostBinding('class.rtl') get isRtl() {
    return this.isRtlMode();
  }

  // Main carousel options
  mainCarouselOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    items: 1,
    autoplay: true,
    autoplayTimeout: 10000, // 10 seconds
    autoplaySpeed: 1000, // Smooth transition (1 second)
    autoplayHoverPause: false, // Don't pause on hover
    nav: true,
    navText: [
      '<i class="fa-solid fa-arrow-left"></i>',
      '<i class="fa-solid fa-arrow-right"></i>',
    ],
    rtl: false,
  };

  ngOnInit(): void {
    this.loadHeroSection();
    if (isPlatformBrowser(this.platformId)) {
      // Subscribe to language changes to update RTL mode
      this.subscription.add(
        this.languageService.getLanguage().subscribe((lang) => {
          const isRtl = lang === 'ar';
          this.isRtlMode.set(isRtl);
          // Update carousel options based on language
          this.updateCarouselRtlSetting();
        })
      );
    }
  }

  ngAfterViewInit(): void {
    // Apply RTL settings after view initialization
    setTimeout(() => {
      this.updateCarouselRtlSetting();
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Update carousel options when RTL mode changes
  private updateCarouselRtlSetting(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const isRtl = this.isRtlMode();

    const navTextForRtl = [
      '<i class="fa-solid fa-arrow-right"></i>',
      '<i class="fa-solid fa-arrow-left"></i>',
    ];

    const navTextForLtr = [
      '<i class="fa-solid fa-arrow-left"></i>',
      '<i class="fa-solid fa-arrow-right"></i>',
    ];

    this.mainCarouselOptions = {
      ...this.mainCarouselOptions,
      rtl: isRtl,
      navText: isRtl ? navTextForRtl : navTextForLtr,
    };

    // Force update on carousel after setting RTL
    setTimeout(() => {
      if (this.mainCarousel && this.mainCarousel.initialized) {
        try {
          // Trick to force carousel update - destroy and initialize again
          const mainElement = document.querySelector(
            '.carousel-wrapper .owl-carousel'
          );
          if (mainElement) {
            mainElement.classList.add('owl-refresh');
            setTimeout(() => {
              mainElement.classList.remove('owl-refresh');
            }, 10);
          }
        } catch (e) {
          console.error('Error refreshing main carousel', e);
        }
      }
    }, 100);
  }

  private loadHeroSection(): void {
    this.subscription.add(
      this.homeService.getHomeData().subscribe({
        next: (data: any) => {
          this.heroSection = data.slider;
        },
        error: (error: unknown) => {
          console.error('Error loading hero section:', error);
        },
      })
    );
  }
}
