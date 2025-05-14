import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { CommonService } from '@core/services/common/common.service';
import { API_CONFIG } from '@core/services/conf/api.config';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { SafeHtmlComponent } from '../../core/safe-html/safe-html.component';
import { LanguageService } from '../../core/services/lang/language.service';
import { ArticlesCardSharedComponent } from '../../shared/components/articles-card-shared/articles-card-shared.component';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading.component';
import { TalentImageCardComponent } from '../../shared/components/talent-image-card/talent-image-card.component';
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
