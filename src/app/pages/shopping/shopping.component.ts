import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ICategory } from '@core/interfaces/common.model';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { CommonService } from '@core/services/common/common.service';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';
import { SearchService } from '@core/services/search/search.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { DismissibleBadgesComponent } from '../../shared/components/dismissible-badges/dismissible-badges.component';
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
  ],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css',
})
export class ShoppingComponent implements OnInit, OnDestroy {
  // ===== Services =====
  private readonly _translate = inject(TranslateService);

  private readonly productsService = inject(ProductsService);

  private readonly categoryService = inject(CommonService);

  private readonly apiService = inject(ApiService);

  private readonly searchService = inject(SearchService);

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

  products: IAllProduct[] = [];

  categories: ICategory[] = [];

  // ===== Subscriptions =====
  private searchSubscription: Subscription | null = null;
  private searchToggleSubscription: Subscription | null = null;
  private searchQuerySubscription: Subscription | null = null;

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
    this.getAllProducts();
    this.getAllCategories();
    this.setupSearchListener();

    // Subscribe to search toggle events
    this.searchToggleSubscription = this.searchService.searchToggle$.subscribe(
      (isOpen) => this.onNavbarSearchToggle(isOpen)
    );

    // Subscribe to search query events
    this.searchQuerySubscription = this.searchService.searchQuery$.subscribe(
      (query) => {
        this.searchQuery.set(query);
        this.resetPagination();
        this.applyFilters();
      }
    );
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

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
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
      // Set up input event listener with debounce
      this.searchSubscription = fromEvent(searchInput, 'input')
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(() => {
          this.searchQuery.set(searchInput.value.trim().toLowerCase());
          this.resetPagination();
          this.applyFilters();
        });

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
    const categorySlug =
      this._translate.currentLang === 'en'
        ? category.en_slug
        : category.ar_slug;

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
    this.selectedFilters.set([]);
    this.stockFilter.set('all');
    this.minPrice = 200;
    this.maxPrice = 1000;
    this.searchQuery.set('');

    // Clear the search input field
    const searchInput = document.getElementById(
      'desktop-search'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }

    this.resetCheckboxes();
    this.resetFilters();
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

    // If we removed the last filter, reset to full product list
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
    this.searchQuery.set('');

    // Clear the search input field
    const searchInput = document.getElementById(
      'desktop-search'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }

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

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((product) => {
        const productName =
          currentLang === 'en'
            ? product.en_name?.toLowerCase() || ''
            : product.ar_name?.toLowerCase() || '';

        const productDescription =
          currentLang === 'en'
            ? product.en_description?.toLowerCase() || ''
            : product.ar_description?.toLowerCase() || '';

        return (
          productName.includes(searchQuery) ||
          productDescription.includes(searchQuery)
        );
      });
    }

    // Apply category filters
    if (selectedSlugs.length > 0) {
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
    this.productsService.getAllProducts().subscribe((response: any) => {
      this.products = response.products;

      // Set the filtered products to all products initially
      this.filteredProducts.set(this.products);

      // Calculate initial total pages
      const initialTotalPages = Math.ceil(this.products.length / this.pageSize);
      this.totalPages.set(Math.max(1, initialTotalPages));

      // Initialize the paginated products
      this.updatePaginatedProducts();
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
}
