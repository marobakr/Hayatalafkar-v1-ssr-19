import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/lang/language.service';
import { DismissibleBadgesComponent } from '../../shared/components/dismissible-badges/dismissible-badges.component';
import { ArticlesHeaderComponent } from '../articles/components/articles-header/articles-header.component';
import { SharedBestSellerComponent } from '../home/components/best-seller/components/shared-best-seller/shared-best-seller.component';

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
  ],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css',
})
export class ShoppingComponent {
  descriptions: string[] = [];
  filterItems: string[] = [];
  selectedFilters: string[] = []; // Holds selected filters

  _translate = inject(TranslateService);
  _languageService = inject(LanguageService);
  _fb = inject(FormBuilder);

  minPrice: number = 200;
  maxPrice: number = 1000;

  filters = {
    bestSelling: false,
    newProducts: false,
    specialOffers: false,
  };

  constructor() {
    // Fetch the proper language from the service
    this._languageService.getLanguage().subscribe((lang) => {
      // Fetch descriptions from translation file
      this._translate.use(lang).subscribe(() => {
        this._translate
          .get('bestSelling.descriptions')
          .subscribe((descriptions: string[]) => {
            this.descriptions = descriptions;
          });
        // Fetch filter items from translation file
        this._translate
          .get('shopping.filter-box.filterItems')
          .subscribe((filterItems: string[]) => {
            console.log(filterItems);
            this.filterItems = filterItems;
          });
      });
    });
  }

  // In your component.ts
  categories = this.filterItems;
  filterForm!: FormGroup;

  // Initialize the form with categories Filter
  initForm() {
    const controls = this.categories.reduce((acc: any, category: any) => {
      acc[category] = new FormControl(false);
      return acc;
    }, {});
    this.filterForm = this._fb.group(controls);
    console.log(this.filterForm);
  }

  ngOnInit() {
    // Initialize the form
    this.initForm();

    // Subscribe to the form changes
    this.filterForm.valueChanges.subscribe((values) => {
      const selected = Object.entries(values)
        .filter(([_, checked]) => checked)
        .map(([key]) => key);

      // Now use `selected` to filter your product list
      console.log('Selected categories:', selected);
    });
  }
  // Add or remove filters based on checkbox selection

  toggleFilter(filter: string, isChecked: any): void {
    if (isChecked.checked) {
      if (!this.selectedFilters.includes(filter)) {
        this.selectedFilters.push(filter);
        console.log(this.selectedFilters);
      }
    } else {
      this.selectedFilters = this.selectedFilters.filter(
        (item) => item !== filter
      );
    }
  }
  // Clear all selected filters
  clearAllFilters(): void {
    this.selectedFilters = [];
  }

  // Handle badge removal from the parent component
  onBadgeRemoved(badge: string): void {
    console.log('badge get form parent', badge);
    console.log('all badge after filter', this.selectedFilters);

    this.selectedFilters = this.selectedFilters.filter(
      (filter) => filter !== badge
    );
    console.log('all badge after filter', this.selectedFilters);

    // Uncheck the corresponding checkbox
    const checkbox = document.querySelector(
      `input[type="checkbox"][value="${badge}"]`
    ) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = false;
    }
  }

  cards: {
    image: string;
    offer: boolean;
  }[] = [
    {
      image: '/images/best-Seller/6.png',
      offer: true,
    },
    {
      image: '/images/best-Seller/4.png',
      offer: true,
    },
    {
      image: '/images/best-Seller/3.png',
      offer: true,
    },

    {
      image: '/images/best-Seller/8.png',
      offer: true,
    },
    {
      image: '/images/best-Seller/9.png',
      offer: true,
    },
    {
      image: '/images/best-Seller/5.png',
      offer: true,
    },

    {
      image: '/images/best-Seller/6.png',
      offer: true,
    },
    {
      image: '/images/best-Seller/4.png',
      offer: true,
    },
    {
      image: '/images/best-Seller/3.png',
      offer: true,
    },
  ];

  onPriceChange() {
    // Prevent minPrice from exceeding maxPrice
    if (this.minPrice > this.maxPrice - 50) {
      // Add 50 as minimum gap
      this.minPrice = this.maxPrice - 50;
    }

    // Prevent maxPrice from going below minPrice
    if (this.maxPrice < this.minPrice + 50) {
      this.maxPrice = this.minPrice + 50;
    }
  }
}
/*
 <div class="grid grid-cols-12 gap-[13px]">
        <!-- Filter Box -->

        <div class="col-span-12 xl:col-span-2">
          <div class="">
            <div
              class="filter-box max-h-[276px] rounded-2xl overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-warm-tan scrollbar-track-[#EEE2E2] p-3 shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
            >
              <h3 class="text-black text-[23px] font-bold mb-6">
                {{ "shopping.filter-box.title" | translate }}
              </h3>

              <!-- CheckBox -->
              @for (filterItem of filterItems; track $index) {

              <label
                class="flex items-center gap-2 cursor-pointer justify-start rtl:justify-end rtl:flex-row-reverse mb-4"
              >
                <input
                  type="checkbox"
                  class="hidden peer"
                  (change)="toggleFilter(filterItem, $event.target)"
                />

                <!-- Label Text -->
                <span class="text-description-size text-[#474747]">
                  {{ filterItem }}
                </span>

                <!-- Custom Checkbox Style -->
                <div
                  class="w-6 h-6 border-2 border-[#8D8D8D] rounded-md flex items-center justify-center text-transparent peer-checked:text-black"
                >
                  <!-- Checkmark Icon -->
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </label>
              }
            </div>
          </div>
        </div>
      </div>
*/

/*
   <div class="space-y-4">
               <label class="flex items-center gap-2 cursor-pointer">
                 <input
                   type="checkbox"
                   class="hidden peer"
                   [(ngModel)]="filters.bestSelling"
                 />
                 <span class="text-description-size text-[#474747]">
                   {{ "shopping.filter.updates.best-selling" | translate }}
                 </span>
                 <div
                   class="w-6 h-6 border-2 border-[#8D8D8D] rounded-md flex items-center justify-center text-transparent peer-checked:text-black"
                 >
                   <svg
                     class="w-4 h-4"
                     fill="none"
                     stroke="currentColor"
                     stroke-width="3"
                     viewBox="0 0 24 24"
                   >
                     <path
                       stroke-linecap="round"
                       stroke-linejoin="round"
                       d="M5 13l4 4L19 7"
                     />
                   </svg>
                 </div>
               </label>

               <label class="flex items-center gap-2 cursor-pointer">
                 <input
                   type="checkbox"
                   class="hidden peer"
                   [(ngModel)]="filters.newProducts"
                 />
                 <span class="text-description-size text-[#474747]">
                   {{ "shopping.filter.updates.new-products" | translate }}
                 </span>
                 <div
                   class="w-6 h-6 border-2 border-[#8D8D8D] rounded-md flex items-center justify-center text-transparent peer-checked:text-black"
                 >
                   <svg
                     class="w-4 h-4"
                     fill="none"
                     stroke="currentColor"
                     stroke-width="3"
                     viewBox="0 0 24 24"
                   >
                     <path
                       stroke-linecap="round"
                       stroke-linejoin="round"
                       d="M5 13l4 4L19 7"
                     />
                   </svg>
                 </div>
               </label>

               <label class="flex items-center gap-2 cursor-pointer">
                 <input
                   type="checkbox"
                   class="hidden peer"
                   [(ngModel)]="filters.specialOffers"
                 />
                 <span class="text-description-size text-[#474747]">
                   {{ "shopping.filter.updates.special-offers" | translate }}
                 </span>
                 <div
                   class="w-6 h-6 border-2 border-[#8D8D8D] rounded-md flex items-center justify-center text-transparent peer-checked:text-black"
                 >
                   <svg
                     class="w-4 h-4"
                     fill="none"
                     stroke="currentColor"
                     stroke-width="3"
                     viewBox="0 0 24 24"
                   >
                     <path
                       stroke-linecap="round"
                       stroke-linejoin="round"
                       d="M5 13l4 4L19 7"
                     />
                   </svg>
                 </div>
               </label>
             </div>
*/
