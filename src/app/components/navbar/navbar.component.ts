import {
  CommonModule,
  isPlatformBrowser,
  NgClass,
  NgOptimizedImage,
} from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LanguageService } from '../../core/services/lang/language.service';
import { MegaMenuComponent } from '../mega-menu/mega-menu.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    MegaMenuComponent,
    NgOptimizedImage,
    NgClass,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnDestroy, OnInit {
  showMenu: boolean = false;
  showSearch: boolean = false;
  showMobileSearch: boolean = false;
  showDesktopSearch: boolean = false;
  showProductsMenu = false;
  showMobileProductsMenu = false;
  showMegaMenu = false;
  isMenuOpen = false;
  isRtl = false;

  // Constants
  private readonly DESKTOP_BREAKPOINT = 1280; // xl breakpoint in Tailwind (in pixels)
  private resizeSubscription?: Subscription;

  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _languageService = inject(LanguageService);
  private platformId = inject(PLATFORM_ID);

  currentLang$ = this._languageService.getLanguage();

  // Add this property to track the last clicked element
  private lastClickedElement: HTMLElement | null = null;

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Set initial RTL state based on current language
    this.currentLang$.subscribe((lang) => {
      this.isRtl = lang === 'ar';
    });

    // Add resize listener to close mobile menu when screen size changes
    if (isPlatformBrowser(this.platformId)) {
      this.resizeSubscription = fromEvent(window, 'resize')
        .pipe(debounceTime(150))
        .subscribe(() => {
          this.checkScreenWidth();
        });

      // Initial screen width check
      this.checkScreenWidth();
    }
  }

  private checkScreenWidth(): void {
    if (window.innerWidth >= this.DESKTOP_BREAKPOINT && this.isMenuOpen) {
      this.isMenuOpen = false;
      document.body.classList.remove('scroll-lock');
    }
  }

  changeLang(lang: string): void {
    const currentUrl = this._router.url;
    this._languageService.changeLanguage(lang, currentUrl);
    this.showMenu = false;
    this.isRtl = lang === 'ar';
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  toggleMobileSearch() {
    this.showMobileSearch = !this.showMobileSearch;
    this.showDesktopSearch = false;
  }

  toggleDesktopSearch() {
    this.showDesktopSearch = !this.showDesktopSearch;
    this.showMobileSearch = false;
  }

  toggleSearch(event: Event) {
    event.stopPropagation();
    this.showSearch = !this.showSearch;
  }

  toggleProductsMenu(event: Event) {
    event.stopPropagation();
    this.showProductsMenu = !this.showProductsMenu;
  }

  toggleMobileProductsMenu(event: Event) {
    event.stopPropagation();
    this.showMobileProductsMenu = !this.showMobileProductsMenu;
  }

  closeProductsMenu() {
    this.showProductsMenu = false;
  }

  @HostListener('document:click')
  onClickOutside() {
    this.showProductsMenu = false;
    this.showMobileProductsMenu = false;

    if (isPlatformBrowser(this.platformId)) {
      const searchContainer =
        this.elementRef.nativeElement.querySelector('.search-container');
      if (!searchContainer?.matches(':hover')) {
        this.showSearch = false;
      }
    }
  }

  toggleMegaMenu(event: Event): void {
    event.stopPropagation();
    const clickedElement = event.target as HTMLElement;
    const listItem = clickedElement.closest('li');

    // If clicking the same li element, close the menu
    if (this.showMegaMenu && listItem && this.lastClickedElement === listItem) {
      this.showMegaMenu = false;
      this.lastClickedElement = null;
      return;
    }

    // Store the clicked element and open the menu
    this.lastClickedElement = listItem;
    this.showMegaMenu = true;
  }

  toggleMobileMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    // Prevent body scroll when menu is open
    if (isPlatformBrowser(this.platformId)) {
      if (this.isMenuOpen) {
        document.body.classList.add('scroll-lock');
      } else {
        document.body.classList.remove('scroll-lock');
      }
    }
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.resizeSubscription?.unsubscribe();

    // Restore body scroll when component is destroyed
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('scroll-lock');
    }
    this.renderer.destroy();
  }
}
