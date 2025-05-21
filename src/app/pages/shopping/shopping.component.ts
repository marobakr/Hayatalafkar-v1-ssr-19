import {
  animate,
  group,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ICategory } from '@core/interfaces/common.model';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { CommonService } from '@core/services/common/common.service';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';
import { SearchService } from '@core/services/search/search.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DismissibleBadgesComponent } from '@shared/components/dismissible-badges/dismissible-badges.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ArticlesHeaderComponent } from '../articles/components/articles-header/articles-header.component';
import { SharedBestSellerComponent } from '../home/components/best-seller/components/shared-best-seller/shared-best-seller.component';
import { IAllProduct } from './res/products.interface';
import { ProductsService } from './res/products.service';

export type StockFilterType = 'all' | 'available' | 'unavailable';

@Component({
  selector: 'app-shopping',
  standalone: true,
  imports: [
    ArticlesHeaderComponent,
    CommonModule,
    TranslateModule,
    DismissibleBadgesComponent,
    SharedBestSellerComponent,
    ReactiveFormsModule,
    FormsModule,
    CustomTranslatePipe,
    NavbarComponent,
    LoadingComponent,
  ],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('filterAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '350ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('productGridAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('50ms', [
              animate(
                '400ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('badgeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.8)' })
        ),
      ]),
    ]),
    trigger('chipAnimation', [
      transition(':enter', [
        style({ opacity: 0, width: 0, marginRight: 0 }),
        group([
          animate('300ms ease', style({ opacity: 1 })),
          animate('300ms ease', style({ width: '*' })),
          animate('300ms ease', style({ marginRight: '*' })),
        ]),
      ]),
      transition(':leave', [
        group([
          animate('200ms ease', style({ opacity: 0 })),
          animate('200ms ease', style({ width: 0 })),
          animate('200ms ease', style({ marginRight: 0 })),
        ]),
      ]),
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
    trigger('cardHover', [
      state(
        'normal',
        style({
          transform: 'translateY(0)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        })
      ),
      state(
        'hovered',
        style({
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.15)',
        })
      ),
      transition('normal <=> hovered', animate('200ms ease-in-out')),
    ]),
  ],
})
export class ShoppingComponent implements OnInit, OnDestroy {
  // ===== Services =====
  private readonly _translate = inject(TranslateService);

  private readonly productsService = inject(ProductsService);

  private readonly categoryService = inject(CommonService);

  private readonly apiService = inject(ApiService);

  private readonly searchService = inject(SearchService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  // ===== Constants =====
  readonly API_CONFIG_IMAGE = API_CONFIG.BASE_URL_IMAGE;

  // ===== State Management =====
  readonly selectedFilters = signal<string[]>([]);

  readonly filteredProducts = signal<IAllProduct[]>([]);

  readonly paginatedProducts = signal<IAllProduct[]>([]);

  readonly stockFilter = signal<StockFilterType>('all');

  readonly currentPage = signal<number>(1);

  readonly totalPages = signal<number>(1);

  readonly searchQuery = signal<string>('');

  readonly categoryId = signal<string | null>(null);

  readonly categoryName = signal<string | null>(null);

  readonly subcategoryId = signal<string | null>(null);

  readonly subcategoryName = signal<string | null>(null);

  readonly isLoading = signal<boolean>(true);

  // Card hover states
  productHoverStates: { [key: number]: string } = {};

  products: IAllProduct[] = [];

  categories: ICategory[] = [];

  // ===== Subscriptions =====
  private searchSubscription: Subscription | null = null;
  private searchToggleSubscription: Subscription | null = null;
  private searchQuerySubscription: Subscription | null = null;
  private routeParamsSubscription: Subscription | null = null;

  // ===== Pagination Configuration =====
  readonly pageSize = 9; // Products per page

  // ===== Price Range Configuration =====
  minPrice: number = 200;
  maxPrice: number = 1000;

  // ===== Mutation Observer =====
  private mutationObserver: MutationObserver | null = null;

  // ===== Lifecycle Hooks =====
  /**
   * Initializes the component by fetching products and categories
   */
  ngOnInit(): void {
    this.getAllCategories();
    this.setupSearchListener();
    this.setupRouteParamsListener();

    // Subscribe to search toggle events
    this.searchToggleSubscription = this.searchService.searchToggle$.subscribe(
      (isOpen) => this.onNavbarSearchToggle(isOpen)
    );

    // Subscribe to search query events with debounce
    this.searchQuerySubscription = this.searchService.searchQuery$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query) => {
        // Update local search query state
        this.searchQuery.set(query);

        // If query is empty, check if we need to clear filters
        if (!query) {
          // Only reset if this was the only filter
          if (
            this.selectedFilters().length === 0 &&
            this.stockFilter() === 'all' &&
            this.minPrice === 200 &&
            this.maxPrice === 1000
          ) {
            this.resetFilters();
          } else {
            this.resetPagination();
            this.applyFilters();
          }
        } else {
          // Apply filters with the new search term
          this.resetPagination();
          this.applyFilters();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    if (this.searchToggleSubscription) {
      this.searchToggleSubscription.unsubscribe();
    }

    if (this.searchQuerySubscription) {
      this.searchQuerySubscription.unsubscribe();
    }

    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  /**
   * Sets up listener for route query parameters
   * Handles category and subcategory filtering from URL
   */
  private setupRouteParamsListener(): void {
    // Track previous route parameters to avoid duplicate API calls
    let previousCategoryId: string | null = null;
    let previousSubcategoryId: string | null = null;
    let previousSearchQuery: string | null = null;

    this.routeParamsSubscription = this.route.queryParams.subscribe(
      (params) => {
        const categoryId = params['categoryId'];
        const subcategoryId = params['subcategoryId'];
        const searchQuery = params['q']; // Get search query from URL if present

        // Only make API calls if parameters have changed
        const categoryChanged = categoryId !== previousCategoryId;
        const subcategoryChanged = subcategoryId !== previousSubcategoryId;
        const searchQueryChanged = searchQuery !== previousSearchQuery;

        // Update tracking variables
        previousCategoryId = categoryId;
        previousSubcategoryId = subcategoryId;
        previousSearchQuery = searchQuery;

        // If search query is present in URL, update the search state
        if (searchQuery) {
          this.searchQuery.set(searchQuery);
          // Also update the search service to maintain consistency
          this.searchService.updateSearchQuery(searchQuery);

          // Update search input field if it exists
          setTimeout(() => {
            const searchInput = document.getElementById(
              'desktop-search'
            ) as HTMLInputElement;
            if (searchInput) {
              searchInput.value = searchQuery;
            }
          }, 100);
        }

        // If neither filter parameter changed, don't make a new API call
        // Note: We still process the search query above even if no API call is needed
        if (!categoryChanged && !subcategoryChanged) {
          if (searchQueryChanged && this.products.length > 0) {
            // If only search query changed and we already have products, just apply filters
            this.resetPagination();
            this.applyFilters();
          }
          return;
        }

        this.isLoading.set(true);

        if (categoryId) {
          // Set category ID parameter
          this.categoryId.set(categoryId);

          // Reset subcategory filters
          this.subcategoryId.set(null);
          this.subcategoryName.set(null);

          // Call API to get products by category
          this.getProductsByCategory(categoryId);
        } else if (subcategoryId) {
          // Set subcategory ID parameter
          this.subcategoryId.set(subcategoryId);

          // Reset category filters
          this.categoryId.set(null);
          this.categoryName.set(null);

          // Call API to get products by subcategory
          this.getProductsBySubcategory(subcategoryId);
        } else {
          // No category/subcategory filter, get all products
          // Only fetch if we're transitioning from having a filter to no filter
          if (categoryChanged || subcategoryChanged) {
            this.getAllProducts();
          }
        }
      }
    );
  }

  /**
   * Fetches products by category
   * @param categoryId The category ID to filter by
   */
  private getProductsByCategory(categoryId: string): void {
    this.productsService.getProductByCategory(categoryId).subscribe({
      next: (response: any) => {
        this.products = response.products || [];

        // Set category name from API response or find from categories list
        if (this.products.length > 0 && this.products[0].category) {
          const currentLang = this._translate.currentLang;
          const categoryName =
            currentLang === 'en'
              ? this.products[0].category.en_name
              : this.products[0].category.ar_name;

          this.categoryName.set(categoryName);

          // Add category to selected filters if not already present
          const currentFilters = this.selectedFilters();
          const categorySlug =
            currentLang === 'en'
              ? this.products[0].category.en_slug
              : this.products[0].category.ar_slug;

          if (categorySlug && !currentFilters.includes(categorySlug)) {
            this.selectedFilters.set([...currentFilters, categorySlug]);

            // Check the corresponding checkbox for this category
            setTimeout(() => {
              const checkbox = document.querySelector(
                `input[type="checkbox"][data-slug="${categorySlug}"]`
              ) as HTMLInputElement;

              if (checkbox) {
                checkbox.checked = true;
              }
            }, 100);
          }
        } else {
          // Try to find category name from categories list if not in API response
          const category = this.categories.find(
            (c) => c.id.toString() === categoryId
          );
          if (category) {
            const currentLang = this._translate.currentLang;
            const categoryName =
              currentLang === 'en' ? category.en_name : category.ar_name;
            const categorySlug =
              currentLang === 'en' ? category.en_slug : category.ar_slug;

            this.categoryName.set(categoryName);

            // Add category to selected filters if not already present
            const currentFilters = this.selectedFilters();
            if (categorySlug && !currentFilters.includes(categorySlug)) {
              this.selectedFilters.set([...currentFilters, categorySlug]);

              // Check the corresponding checkbox for this category
              setTimeout(() => {
                const checkbox = document.querySelector(
                  `input[type="checkbox"][data-slug="${categorySlug}"]`
                ) as HTMLInputElement;

                if (checkbox) {
                  checkbox.checked = true;
                }
              }, 100);
            }
          }
        }

        // Reset other filters when navigating from mega menu
        this.stockFilter.set('all');
        this.minPrice = 200;
        this.maxPrice = 1000;
        this.searchQuery.set('');

        // Update filters and pagination
        this.filteredProducts.set(this.products);
        const initialTotalPages = Math.ceil(
          this.products.length / this.pageSize
        );
        this.totalPages.set(Math.max(1, initialTotalPages));
        this.updatePaginatedProducts();
        this.isLoading.set(false);

        // Initialize hover states for products
        this.initProductHoverStates();
      },
      error: (err) => {
        console.error('Error fetching products by category:', err);
        this.products = [];
        this.filteredProducts.set([]);
        this.paginatedProducts.set([]);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Fetches products by subcategory
   * @param subcategoryId The subcategory ID to filter by
   */
  private getProductsBySubcategory(subcategoryId: string): void {
    this.productsService.getProductBySubcategory(subcategoryId).subscribe({
      next: (response: any) => {
        this.products = response.products || [];

        // Try to find subcategory name from first product's subcategory info
        if (this.products.length > 0 && this.products[0].subcategory) {
          const currentLang = this._translate.currentLang;
          const subcategoryName =
            currentLang === 'en'
              ? this.products[0].subcategory.en_name
              : this.products[0].subcategory.ar_name;

          const categoryName =
            currentLang === 'en'
              ? this.products[0].category.en_name
              : this.products[0].category.ar_name;

          const categorySlug =
            currentLang === 'en'
              ? this.products[0].category.en_slug
              : this.products[0].category.ar_slug;

          const categoryId = this.products[0].category.id;

          this.categoryName.set(categoryName);
          this.subcategoryName.set(subcategoryName);

          // When coming from subcategory navigation, we want to add the parent category
          // to the selected filters, but not the subcategory (since it's not in the sidebar)
          if (categorySlug) {
            // First clear any existing filters to avoid conflicts
            this.selectedFilters.set([]);

            // Add parent category to selected filters
            this.selectedFilters.set([categorySlug]);

            // Reset all checkboxes first to ensure clean state
            this.resetCheckboxes();

            // Check only the parent category checkbox
            setTimeout(() => {
              const checkbox = document.querySelector(
                `input[type="checkbox"][data-slug="${categorySlug}"]`
              ) as HTMLInputElement;

              if (checkbox) {
                checkbox.checked = true;
              }
            }, 100);
          }
        }

        // Reset other filters when navigating from mega menu
        this.stockFilter.set('all');
        this.minPrice = 200;
        this.maxPrice = 1000;
        this.searchQuery.set('');

        // Update filters and pagination
        this.filteredProducts.set(this.products);
        const initialTotalPages = Math.ceil(
          this.products.length / this.pageSize
        );
        this.totalPages.set(Math.max(1, initialTotalPages));
        this.updatePaginatedProducts();
        this.isLoading.set(false);

        // Initialize hover states for products
        this.initProductHoverStates();
      },
      error: (err) => {
        console.error('Error fetching products by subcategory:', err);
        this.products = [];
        this.filteredProducts.set([]);
        this.paginatedProducts.set([]);
        this.isLoading.set(false);
      },
    });
  }

  // ===== Public Methods =====
  /**
   * Sets up event listener for the navbar search input
   */
  private setupSearchListener(): void {
    // Initial attempt to find the search input
    this.checkAndSetupSearchInput();

    // Create MutationObserver to detect when search input is added to the DOM
    const observer = new MutationObserver(() => {
      this.checkAndSetupSearchInput();
    });

    // Start observing the document body for DOM changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Clean up observer on component destroy
    this.mutationObserver = observer;
  }

  /**
   * Checks for search input element and sets up listeners
   */
  private checkAndSetupSearchInput(): void {
    const searchInput = document.getElementById(
      'desktop-search'
    ) as HTMLInputElement;

    // If we found the input and haven't subscribed yet
    if (searchInput && !this.searchSubscription) {
      // If we have an active search query, update the input field
      if (this.searchQuery()) {
        searchInput.value = this.searchQuery();
      }

      // We don't need to set up a local subscription for the input events
      // since the navbar component already handles this through the search service

      // Check if there's a query parameter in the URL for search
      const urlParams = new URLSearchParams(window.location.search);
      const searchParam = urlParams.get('q');

      if (searchParam) {
        searchInput.value = searchParam;
        this.searchQuery.set(searchParam.trim().toLowerCase());
        this.resetPagination();
        this.applyFilters();
      }
    }
  }

  /**
   * Handles category filter toggle events
   * Updates selected filters based on checkbox state
   * Maintains language-aware category slugs
   */
  toggleFilter(category: ICategory, event: any): void {
    const isChecked = event.checked;
    const currentFilters = this.selectedFilters();
    const currentLang = this._translate.currentLang;
    const categorySlug =
      currentLang === 'en' ? category.en_slug : category.ar_slug;

    // If a subcategory filter is active and we're checking a category filter,
    // clear the subcategory filter from the route
    if (isChecked && this.subcategoryId()) {
      this.subcategoryId.set(null);
      this.subcategoryName.set(null);

      // Update URL to remove subcategory parameter, but maintain categoryId
      this.router.navigate(['/' + currentLang + '/shopping'], {
        queryParams: { categoryId: category.id },
        replaceUrl: true,
      });
    }

    if (isChecked) {
      if (!currentFilters.includes(categorySlug)) {
        this.selectedFilters.set([...currentFilters, categorySlug]);
      }
    } else {
      this.selectedFilters.set(
        currentFilters.filter((item) => item !== categorySlug)
      );
    }

    // If we've unselected the last category and have no other filters
    if (
      this.selectedFilters().length === 0 &&
      this.stockFilter() === 'all' &&
      this.minPrice === 200 &&
      this.maxPrice === 1000 &&
      !this.searchQuery()
    ) {
      this.resetFilters();
    } else {
      this.resetPagination();
      this.applyFilters();
    }
  }

  /**
   * Toggles the stock availability filter
   * Updates the filter state and applies filters
   */
  toggleAvailabilityFilter(isAvailable: boolean): void {
    // If the current filter is already set to the same value, toggle it off
    if (
      (isAvailable && this.stockFilter() === 'available') ||
      (!isAvailable && this.stockFilter() === 'unavailable')
    ) {
      this.stockFilter.set('all');
    } else {
      this.stockFilter.set(isAvailable ? 'available' : 'unavailable');
    }

    // If all filters are now removed, reset to show all products
    if (
      this.selectedFilters().length === 0 &&
      this.stockFilter() === 'all' &&
      this.minPrice === 200 &&
      this.maxPrice === 1000 &&
      !this.searchQuery()
    ) {
      this.resetFilters();
    } else {
      this.resetPagination();
      this.applyFilters();
    }
  }

  /**
   * Handles price range changes during slider movement
   * Updates filtered products based on price range
   */
  onPriceChange(): void {
    this.adjustPriceRange();

    // Only apply filters during sliding - don't check for defaults here
    this.resetPagination();
    this.applyFilters();
  }

  /**
   * Handles the completion of price range sliding
   * Checks if price is back to default and resets if needed
   */
  onPriceRangeComplete(): void {
    // Check if we're back to default price range and no other filters
    const isDefaultPrice =
      Math.abs(this.minPrice - 200) < 5 && Math.abs(this.maxPrice - 1000) < 5;

    if (
      isDefaultPrice &&
      this.selectedFilters().length === 0 &&
      this.stockFilter() === 'all' &&
      !this.searchQuery()
    ) {
      // Force reset to exact defaults
      this.resetPriceToDefault();
    }
  }

  /**
   * Resets price filters to default values
   */
  resetPriceToDefault(): void {
    this.minPrice = 200;
    this.maxPrice = 1000;

    if (
      this.selectedFilters().length === 0 &&
      this.stockFilter() === 'all' &&
      !this.searchQuery()
    ) {
      this.resetFilters();
    } else {
      this.resetPagination();
      this.applyFilters();
    }
  }

  /**
   * Clears all active filters
   * Resets checkboxes to unchecked state
   * Restores full product list
   */
  clearAllFilters(): void {
    // Reset all filter state
    this.selectedFilters.set([]);
    this.stockFilter.set('all');
    this.minPrice = 200;
    this.maxPrice = 1000;
    this.searchQuery.set('');
    this.categoryId.set(null);
    this.categoryName.set(null);
    this.subcategoryId.set(null);
    this.subcategoryName.set(null);

    // Clear the search input field
    const searchInput = document.getElementById(
      'desktop-search'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }

    // Also update the search service to maintain consistency
    this.searchService.updateSearchQuery('');

    // Reset all checkboxes in the UI
    this.resetCheckboxes();
    this.resetFilters();

    // Update URL to remove all query parameters
    this.router.navigate(['/' + this._translate.currentLang + '/shopping'], {
      replaceUrl: true,
      queryParams: {}, // Clear all query parameters
    });

    // Fetch all products since we've cleared both category and subcategory filters
    this.getAllProducts();
  }

  /**
   * Handles badge removal events
   * Updates selected filters
   * Unchecks corresponding category checkbox
   */
  onBadgeRemoved(badge: string): void {
    const currentFilters = this.selectedFilters();
    this.selectedFilters.set(
      currentFilters.filter((filter) => filter !== badge)
    );

    this.uncheckCategoryCheckbox(badge);

    // Check if this badge corresponds to the current category or subcategory filter
    const currentCategorySlug =
      this.categories.find((cat) => cat.id.toString() === this.categoryId())
        ?.en_slug ||
      this.categories.find((cat) => cat.id.toString() === this.categoryId())
        ?.ar_slug;

    // If the removed badge matches the current category, clear URL parameters
    if (badge === currentCategorySlug) {
      this.categoryId.set(null);
      this.categoryName.set(null);

      // Update URL to remove the category ID parameter
      this.router.navigate(['/' + this._translate.currentLang + '/shopping'], {
        replaceUrl: true,
      });
    }

    // If we removed the last filter, reset to full product list
    if (
      this.selectedFilters().length === 0 &&
      this.stockFilter() === 'all' &&
      this.minPrice === 200 &&
      this.maxPrice === 1000 &&
      !this.searchQuery()
    ) {
      this.resetFilters();
      this.getAllProducts();
    } else {
      this.resetPagination();
      this.applyFilters();
    }
  }

  /**
   * Navigate to the specified page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.updatePaginatedProducts();
    }
  }

  /**
   * Navigate to the previous page
   */
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.updatePaginatedProducts();
    }
  }

  /**
   * Navigate to the next page
   */
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
      this.updatePaginatedProducts();
    }
  }

  /**
   * Generates an array of page numbers for pagination controls
   */
  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total === 0) {
      return [1];
    }

    // Show max 5 page numbers with current page in the middle when possible
    const pageNumbers: number[] = [];
    const maxVisiblePages = 5;

    if (total <= maxVisiblePages) {
      // If we have 5 or fewer pages, show all
      for (let i = 1; i <= total; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Calculate start and end for showing pages with current in middle
      let start = Math.max(current - Math.floor(maxVisiblePages / 2), 1);
      let end = start + maxVisiblePages - 1;

      // Adjust if end is beyond total pages
      if (end > total) {
        end = total;
        start = Math.max(end - maxVisiblePages + 1, 1);
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers.length ? pageNumbers : [1];
  }

  /**
   * Opens the navbar search box when clicking the search hint
   */
  openSearchBox(): void {
    // Use the search service to open the search
    this.searchService.toggleSearch(true);

    // Find the navbar search button and click it as a fallback
    const searchButton = document.querySelector(
      '.search-container button'
    ) as HTMLButtonElement;
    if (searchButton) {
      searchButton.click();
    }
  }

  /**
   * Syncs the shopping component's search state with the navbar search
   * @param isNavbarSearchOpen Whether the navbar search is open
   */
  public onNavbarSearchToggle(isNavbarSearchOpen: boolean): void {
    if (isNavbarSearchOpen) {
      setTimeout(() => {
        const searchInput = document.getElementById(
          'desktop-search'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    } else if (!isNavbarSearchOpen && this.searchQuery()) {
      // If navbar search is closed and we had a search query, clear it
      this.clearSearchFilter();
    }
  }

  /**
   * Clears only the search filter
   */
  clearSearchFilter(): void {
    // Clear local search query state
    this.searchQuery.set('');

    // Also update the search service to maintain consistency
    this.searchService.updateSearchQuery('');

    // Clear the search input field in the UI
    const searchInput = document.getElementById(
      'desktop-search'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }

    // Remove search query parameter from URL
    this.router.navigate([], {
      queryParams: { q: null },
      queryParamsHandling: 'merge', // Keep other query parameters
    });

    // If all filters are now removed, reset to show all products
    if (
      this.selectedFilters().length === 0 &&
      this.stockFilter() === 'all' &&
      this.minPrice === 200 &&
      this.maxPrice === 1000
    ) {
      this.resetFilters();
    } else {
      this.resetPagination();
      this.applyFilters();
    }
  }

  // ===== Private Methods =====
  /**
   * Applies current filters to product list
   * Filters products based on selected category slugs and stock status
   * Handles language-specific category matching
   */
  private applyFilters(): void {
    const selectedSlugs = this.selectedFilters();
    const currentLang = this._translate.currentLang;
    const stockFilterValue = this.stockFilter();
    const searchQuery = this.searchQuery();

    // If no filters are applied and stock filter is 'all', just show all products
    const isDefaultPrice =
      Math.abs(this.minPrice - 200) < 5 && Math.abs(this.maxPrice - 1000) < 5;

    if (
      selectedSlugs.length === 0 &&
      stockFilterValue === 'all' &&
      isDefaultPrice &&
      !searchQuery
    ) {
      // Force reset to exact defaults
      this.minPrice = 200;
      this.maxPrice = 1000;
      this.resetFilters();
      return;
    }

    let filtered = this.products;

    // Apply search filter first for better performance
    // (reduce the dataset before applying other filters)
    if (searchQuery) {
      filtered = filtered.filter((product) => {
        // Get language-specific name and description
        const productName =
          currentLang === 'en'
            ? product.en_name?.toLowerCase() || ''
            : product.ar_name?.toLowerCase() || '';

        const productDescription =
          currentLang === 'en'
            ? product.en_description?.toLowerCase() || ''
            : product.ar_description?.toLowerCase() || '';

        // Get language-specific slugs for product and its category
        const productSlug =
          currentLang === 'en'
            ? product.en_slug?.toLowerCase() || ''
            : product.ar_slug?.toLowerCase() || '';

        const categorySlug =
          currentLang === 'en'
            ? product.category?.en_slug?.toLowerCase() || ''
            : product.category?.ar_slug?.toLowerCase() || '';

        const subcategorySlug = product.subcategory
          ? currentLang === 'en'
            ? product.subcategory.en_slug?.toLowerCase() || ''
            : product.subcategory.ar_slug?.toLowerCase() || ''
          : '';

        // More comprehensive search across multiple fields
        return (
          productName.includes(searchQuery) ||
          productDescription.includes(searchQuery) ||
          productSlug.includes(searchQuery) ||
          categorySlug.includes(searchQuery) ||
          subcategorySlug.includes(searchQuery) ||
          // Optional fields from any custom product properties
          (product as any).sku?.toLowerCase()?.includes(searchQuery) ||
          (product as any).barcode?.toLowerCase()?.includes(searchQuery)
        );
      });
    }

    // Apply category filters - this takes precedence over subcategory filters
    if (selectedSlugs.length > 0) {
      // If we have manual category filters applied, they should override subcategory context
      if (this.subcategoryId() && !this.categoryId()) {
        // Clear subcategory context since category filters take precedence
        this.subcategoryId.set(null);
        this.subcategoryName.set(null);

        // Don't update URL here, as that was already handled in toggleFilter
      }

      filtered = filtered.filter((product) => {
        const productSlug =
          currentLang === 'en'
            ? product.category?.en_slug
            : product.category?.ar_slug;
        return selectedSlugs.includes(productSlug || '');
      });
    }

    // Apply stock status filter
    if (stockFilterValue === 'available') {
      filtered = filtered.filter((product) => product.stock_status === true);
    } else if (stockFilterValue === 'unavailable') {
      filtered = filtered.filter((product) => product.stock_status === false);
    }

    // Apply price filter
    filtered = filtered.filter((product) => {
      // Convert product price to number
      let productPrice = 0;

      if (typeof product.price === 'string') {
        productPrice = parseFloat(product.price);
      } else if (typeof product.price === 'number') {
        productPrice = product.price;
      } else if (product.price_after_sale) {
        // Try to use price_after_sale if price is invalid
        productPrice =
          typeof product.price_after_sale === 'string'
            ? parseFloat(product.price_after_sale)
            : product.price_after_sale;
      }

      // Handle NaN cases
      if (isNaN(productPrice)) {
        return false;
      }

      return productPrice >= this.minPrice && productPrice <= this.maxPrice;
    });

    // First update filtered products
    this.filteredProducts.set(filtered);

    // Then update total pages
    const newTotalPages = Math.max(
      1,
      Math.ceil(filtered.length / this.pageSize)
    );
    this.totalPages.set(newTotalPages);

    // If current page is now beyond total pages, reset to page 1
    if (this.currentPage() > newTotalPages) {
      this.currentPage.set(1);
    }

    // Finally update the paginated products
    this.updatePaginatedProducts();
  }

  /**
   * Updates the paginated products based on current page and page size
   */
  private updatePaginatedProducts(): void {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    const filtered = this.filteredProducts();

    const paginatedItems = filtered.slice(start, end);
    this.paginatedProducts.set(paginatedItems);
  }

  /**
   * Reset filters to show all products but keep pagination state
   */
  private resetFilters(): void {
    // Force reset price to exact defaults
    this.minPrice = 200;
    this.maxPrice = 1000;

    // Reset to show all products
    this.filteredProducts.set(this.products);

    // Recalculate total pages based on all products
    const totalPages = Math.max(
      1,
      Math.ceil(this.products.length / this.pageSize)
    );
    this.totalPages.set(totalPages);

    // Reset to first page
    this.currentPage.set(1);

    // Update paginated products
    this.updatePaginatedProducts();
  }

  /**
   * Resets pagination to first page
   */
  private resetPagination(): void {
    this.currentPage.set(1);
  }

  /**
   * Fetches all products from the API
   * Initializes the product list and filtered products
   */
  private getAllProducts(): void {
    this.isLoading.set(true);
    this.productsService.getAllProducts().subscribe({
      next: (response: any) => {
        this.products = response.products || [];
        this.filteredProducts.set(this.products);
        const initialTotalPages = Math.ceil(
          this.products.length / this.pageSize
        );
        this.totalPages.set(Math.max(1, initialTotalPages));
        this.updatePaginatedProducts();
        this.isLoading.set(false);

        // Initialize hover states for products
        this.initProductHoverStates();
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.products = [];
        this.filteredProducts.set([]);
        this.paginatedProducts.set([]);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Fetches all categories from the API
   * Initializes the category list for filtering
   */
  private getAllCategories(): void {
    this.categoryService.getAllCategories().subscribe((response: any) => {
      this.categories = response.categories;
    });
  }

  /**
   * Resets all checkbox inputs to unchecked state
   */
  private resetCheckboxes(): void {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: any) => {
      checkbox.checked = false;
    });
  }

  /**
   * Unchecks the checkbox for a specific category
   */
  private uncheckCategoryCheckbox(badge: string): void {
    const checkbox = document.querySelector(
      `input[type="checkbox"][data-slug="${badge}"]`
    ) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = false;
    }
  }

  /**
   * Adjusts price range to maintain minimum gap
   */
  private adjustPriceRange(): void {
    if (this.minPrice > this.maxPrice - 50) {
      this.minPrice = this.maxPrice - 50;
    }
    if (this.maxPrice < this.minPrice + 50) {
      this.maxPrice = this.minPrice + 50;
    }
  }

  /**
   * Track product card hover state
   */
  onProductMouseEnter(productId: number): void {
    this.productHoverStates[productId] = 'hovered';
  }

  onProductMouseLeave(productId: number): void {
    this.productHoverStates[productId] = 'normal';
  }

  /**
   * Initialize product hover states after products are loaded
   */
  private initProductHoverStates(): void {
    this.products.forEach((product) => {
      this.productHoverStates[product.id] = 'normal';
    });
  }
}
