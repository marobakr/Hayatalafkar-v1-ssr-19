import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { SafeHtmlComponent } from '@core/safe-html/safe-html.component';
import { CommonService } from '@core/services/common/common.service';
import { API_CONFIG } from '@core/services/conf/api.config';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ArticlesCardSharedComponent } from '@shared/components/articles-card-shared/articles-card-shared.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { SectionHeadingComponent } from '@shared/components/section-heading/section-heading.component';
import { TalentImageCardComponent } from '@shared/components/talent-image-card/talent-image-card.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { LatestProduct } from '../home/res/home.interfaces';
import { HomeService } from '../home/res/home.service';
import { ArticlesHeaderComponent } from './components/articles-header/articles-header.component';
import { BlogsService } from './res/service/blogs.service';
@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    ArticlesHeaderComponent,
    ArticlesCardSharedComponent,
    SectionHeadingComponent,
    TalentImageCardComponent,
    TranslateModule,
    NgxPaginationModule,
    CommonModule,
    CustomTranslatePipe,
    AsyncPipe,
    RouterLink,
    SafeHtmlComponent,
    ImageUrlDirective,
    LoadingComponent,
  ],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css',
})
export class ArticlesComponent {
  _translate = inject(TranslateService);

  _languageService = inject(LanguageService);

  currentLanguage$ = inject(LanguageService).getLanguage();

  _API_CONFIG = API_CONFIG.BASE_URL_IMAGE;

  _homeService = inject(HomeService);

  _blogsService = inject(BlogsService);

  _commonService = inject(CommonService);

  // Pagination properties
  currentPage = 1;

  totalItems = 0;

  itemsPerPage = 9;

  loading = true;

  error = false;

  latestProducts: LatestProduct[] = [];

  titles: string[] = [];

  blogs: any[] = [];

  constructor() {
    this._languageService.getLanguage().subscribe((lang) => {
      this._translate.use(lang).subscribe(() => {
        this._translate
          .get('articles.sidebar.popular-articles')
          .subscribe((titles: string[]) => {
            console.log(titles);
            this.titles = titles;
          });
      });
    });
  }

  ngOnInit() {
    this.loadBlogs();
    this.getLatestProduct();
  }

  loadBlogs(pageUrl?: string) {
    this.loading = true;
    this.error = false;

    this._blogsService.getAllBlogs(pageUrl).subscribe({
      next: (response: any) => {
        console.log('response', response);
        if (response && response.rows) {
          this.blogs = response.rows.data || [];
          this.currentPage = response.rows.current_page;
          this.totalItems = response.rows.total;
          this.itemsPerPage = response.rows.per_page;
        } else {
          this.blogs = [];
          this.error = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching blogs:', err);
        this.blogs = [];
        this.loading = false;
        this.error = true;
      },
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    const pageUrl = `?page=${page}`;
    this.loadBlogs(pageUrl);
  }

  /**
   * Calculate the total number of pages
   * @returns Total number of pages
   */
  totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  /**
   * Generates an array of page numbers for pagination display
   * @returns Array of page numbers to display
   */
  getPageNumbers(): number[] {
    const totalPages = this.totalPages();

    // Show only 4 pages as in the UI design
    const maxVisiblePages = 4;

    // If we have 4 or fewer pages, show all in reverse order
    if (totalPages <= maxVisiblePages) {
      // Create array [totalPages, totalPages-1, ..., 1]
      return Array.from({ length: totalPages }, (_, i) => totalPages - i);
    }

    // If current page is near the end, show last 4 pages
    if (this.currentPage > totalPages - maxVisiblePages + 1) {
      return [totalPages, totalPages - 1, totalPages - 2, totalPages - 3];
    }

    // Otherwise show a window of pages ending with current page
    let start = Math.max(1, this.currentPage - 3);
    let end = Math.min(start + 3, totalPages);

    // Generate pages in reverse order (e.g., [4,3,2,1])
    const pages = [];
    for (let i = end; i >= start; i--) {
      pages.push(i);
    }

    return pages;
  }

  getLatestProduct() {
    this._commonService.getLatestProduct().subscribe((res: any) => {
      this.latestProducts = res.latestProducts;
    });
  }

  getHomeData() {
    this._homeService.getHomeData().subscribe({
      next: (response: any) => {
        this.latestProducts = response.latestProducts;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
