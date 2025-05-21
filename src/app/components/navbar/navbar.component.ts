import {
  CommonModule,
  isPlatformBrowser,
  NgClass,
  NgOptimizedImage,
} from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, filter, take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth/auth.service';
import { CartStateService } from '../../core/services/cart/cart-state.service';
import { LanguageService } from '../../core/services/lang/language.service';
import { SearchService } from '../../core/services/search/search.service';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
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

  // Custom events for search state
  @Output() searchToggle = new EventEmitter<boolean>();

  // Constants
  private readonly DESKTOP_BREAKPOINT = 1280; // xl breakpoint in Tailwind (in pixels)
  private resizeSubscription?: Subscription;

  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _searchService = inject(SearchService);
  private _authService = inject(AuthService);
  private _wishlistService = inject(WishlistService);
  private _cartStateService = inject(CartStateService);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);

  // Get wishlist count as a signal
  wishlistCount = this._wishlistService.getWishlistCountSignal();

  // Get cart count as a signal
  cartCount = this._cartStateService.cartCount;

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

    // Load wishlist count
    this._wishlistService.loadWishlistCount();

    // Check if user is authenticated before initializing cart
    if (this._authService.isAuthenticated()) {
      // Directly fetch the cart to ensure we get the correct count immediately
      this._cartStateService.fetchCart();

      // Set up a periodic refresh every 30 seconds while the user is active
      const refreshCartInterval = setInterval(() => {
        if (
          document.visibilityState === 'visible' &&
          this._authService.isAuthenticated()
        ) {
          this._cartStateService.fetchCart();
        }
      }, 30000); // 30 seconds

      // Clean up interval on component destroy
      this.destroyRef.onDestroy(() => {
        clearInterval(refreshCartInterval);
      });
    }

    // Set up event listener to refresh the wishlist count and cart
    // and monitor authentication state
    this._router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: NavigationEnd) => {
        // Check if authenticated and load data accordingly
        if (this._authService.isAuthenticated()) {
          // Always refresh wishlist count on navigation
          this._wishlistService.loadWishlistCount();

          // For cart pages, we need to check orders and fetch cart
          if (event.url.includes('/cart')) {
            this._cartStateService.checkConfirmedOrders();
            this._cartStateService.fetchCart();
          }
          // For other pages, just update cart count for the navbar
          else {
            this._cartStateService.updateCartCount();
          }
        }
      });
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

  toggleSearch(event: Event): void {
    event.stopPropagation();
    this.showSearch = !this.showSearch;

    // Notify search service about search toggle state
    this._searchService.toggleSearch(this.showSearch);

    // If opening search, focus the input after a short delay
    if (this.showSearch) {
      setTimeout(() => {
        const searchInput = document.getElementById(
          'desktop-search'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
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
        if (this.showSearch) {
          this.showSearch = false;

          // Use the search service
          this._searchService.toggleSearch(false);
        }
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

        // Focus the mobile search input after a short delay to allow the menu to render
        setTimeout(() => {
          const mobileSearchInput = document.getElementById(
            'mobile-search'
          ) as HTMLInputElement;
          if (mobileSearchInput) {
            mobileSearchInput.focus();
          }
        }, 300);
      } else {
        document.body.classList.remove('scroll-lock');
      }
    }
  }

  /**
   * Handles navigation when the profile icon is clicked
   * Redirects to login page if not authenticated, otherwise goes to profile
   */
  navigateToProfile(): void {
    let lang = '';
    this.currentLang$.subscribe((next) => (lang = next));

    if (this._authService.isAuthenticated()) {
      // User is authenticated, navigate to profile page
      this._router.navigate(['/', lang, 'profile']);
    } else {
      // User is not authenticated, redirect to login page
      this._router.navigate(['/', lang, 'login']);
    }
  }

  /**
   * Check if user is authenticated
   * @returns boolean indicating authentication status
   */
  isAuthenticated(): boolean {
    return this._authService.isAuthenticated();
  }

  /**
   * Logs out the current user and redirects to home page
   */
  logout(): void {
    this._authService.logout().subscribe({
      next: () => {
        // Reset wishlist count
        this._wishlistService.loadWishlistCount();

        // Reset cart state and count to zero for logged out user
        this._cartStateService.checkConfirmedOrders();
        this._cartStateService.fetchCart();

        // Closing mobile menu if open after logout
        if (this.isMenuOpen) {
          this.toggleMobileMenu();
        }
      },
      error: (error) => {
        console.error('Logout error:', error);
      },
    });
  }

  onSearchInput(event: Event): void {
    const searchInput = event.target as HTMLInputElement;
    const searchQuery = searchInput.value.trim().toLowerCase();

    // Update search query in service
    this._searchService.updateSearchQuery(searchQuery);

    // If not already on shopping page and search has content, navigate there
    if (searchQuery && !this._router.url.includes('/shopping')) {
      // Get the current language and navigate to shopping page with search query parameter
      this.currentLang$.pipe(take(1)).subscribe((lang) => {
        this._router.navigate(['/', lang, 'shopping'], {
          queryParams: { q: searchQuery },
        });
      });
    } else if (searchQuery && this._router.url.includes('/shopping')) {
      // If already on shopping page, just update the URL with the search query
      this._router.navigate([], {
        queryParams: { q: searchQuery },
        queryParamsHandling: 'merge', // Keep other query parameters
      });
    } else if (!searchQuery && this._router.url.includes('/shopping')) {
      // If search is cleared and we're on shopping page, remove the q parameter
      this._router.navigate([], {
        queryParams: { q: null },
        queryParamsHandling: 'merge', // Keep other query parameters
      });
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
