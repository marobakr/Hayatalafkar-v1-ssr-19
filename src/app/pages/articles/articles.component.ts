import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/lang/language.service';
import { ArticlesCardSharedComponent } from '../../shared/components/articles-card-shared/articles-card-shared.component';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading.component';
import { TalentImageCardComponent } from '../../shared/components/talent-image-card/talent-image-card.component';
import { ArticlesHeaderComponent } from './components/articles-header/articles-header.component';
import { BlogsService } from './res/blogs.service';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    ArticlesHeaderComponent,
    ArticlesCardSharedComponent,
    SectionHeadingComponent,
    TalentImageCardComponent,
    TranslateModule,
  ],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css',
})
export class ArticlesComponent {
  _translate = inject(TranslateService);
  _languageService = inject(LanguageService);

  titles: string[] = [];

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

  blogsService = inject(BlogsService);

  blogs: any[] = [];

  ngOnInit() {
    this.blogsService.getAllBlogs().subscribe({
      next: (response: any) => {
        console.log('API response:', response);

        if (response && response.rows && Array.isArray(response.rows.data)) {
          this.blogs = response.rows.data;
        } else if (response && Array.isArray(response)) {
          this.blogs = response;
        } else {
          console.error('Unexpected response structure:', response);
          this.blogs = [];
        }

        console.log('Processed blogs array:', this.blogs);
      },
      error: (err) => {
        console.error('Error fetching blogs:', err);
        this.blogs = [];
      },
    });
  }
}
