import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ICategory } from '@core/interfaces/common.model';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { CategoryService } from '@core/services/category.service';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
    TranslateModule,
    DismissibleBadgesComponent,
    SharedBestSellerComponent,
    ReactiveFormsModule,
    FormsModule,
    CustomTranslatePipe,
  ],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css',
})
export class ShoppingComponent {
  // ===== Services =====
  private readonly _translate = inject(TranslateService);
  private readonly productsService = inject(ProductsService);
  private readonly categoryService = inject(CategoryService);
  private readonly apiService = inject(ApiService);

  // ===== Constants =====
  readonly API_CONFIG_IMAGE = API_CONFIG.BASE_URL_IMAGE;

  // ===== State Management =====
  readonly selectedFilters = signal<string[]>([]);
  readonly filteredProducts = signal<IAllProduct[]>([]);
  readonly stockFilter = signal<StockFilterType>('all');
  products: IAllProduct[] = [];
  categories: ICategory[] = [];

  // ===== Price Range Configuration =====
  minPrice: number = 200;
  maxPrice: number = 1000;

  // ===== Lifecycle Hooks =====
  /**
   * Initializes the component by fetching products and categories
   */
  ngOnInit(): void {
    this.getAllProducts();
    this.getAllCategories();
  }

  // ===== Public Methods =====
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

    this.applyFilters();
  }

  /**
   * Toggles the stock availability filter
   * Updates the filter state and applies filters
   */
  toggleAvailabilityFilter(isAvailable: boolean): void {
    this.stockFilter.set(isAvailable ? 'available' : 'unavailable');
    this.applyFilters();
  }

  /**
   * Resets stock filter to show all products
   */
  resetStockFilter(): void {
    this.stockFilter.set('all');
    this.applyFilters();
  }

  /**
   * Clears all active filters
   * Resets checkboxes to unchecked state
   * Restores full product list
   */
  clearAllFilters(): void {
    this.selectedFilters.set([]);
    this.stockFilter.set('all');
    this.applyFilters();
    this.resetCheckboxes();
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
    this.applyFilters();
  }

  /**
   * Handles price range changes
   * Maintains minimum gap between min and max prices
   * Updates filtered products based on price range
   */
  onPriceChange(): void {
    this.adjustPriceRange();
    this.applyFilters();
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

    let filtered = this.products;

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

    this.filteredProducts.set(filtered);
  }

  /**
   * Fetches all products from the API
   * Initializes the product list and filtered products
   */
  private getAllProducts(): void {
    this.productsService.getAllProducts().subscribe((response: any) => {
      this.products = response.products;
      this.filteredProducts.set(this.products);
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
