import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { SafeHtmlWithScriptsDirective } from '@core/directives/safe-html-with-script.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { SafeHtmlComponent } from '@core/safe-html/safe-html.component';
import { ApiService } from '@core/services/conf/api.service';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading.component';
import { TalentImageCardComponent } from '../../shared/components/talent-image-card/talent-image-card.component';
import { RelatedBlogsComponent } from '../articles/components/related-blogs/related-blogs.component';
import { IBlog } from '../articles/res/interfaces/blogs';
import { ISingleBlog } from '../articles/res/interfaces/singleBlog';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    TalentImageCardComponent,
    SectionHeadingComponent,
    TranslateModule,
    RelatedBlogsComponent,
    SafeHtmlComponent,
    CustomTranslatePipe,
    SafeHtmlWithScriptsDirective,
    AsyncPipe,
    RouterLink,
    ImageUrlDirective,
  ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
})
export class BlogComponent implements OnInit {
  _translate = inject(TranslateService);

  _languageService = inject(LanguageService);

  _route = inject(ActivatedRoute);

  _apiService = inject(ApiService);

  currentLanguage$ = inject(LanguageService).getLanguage();

  titles: string[] = [];

  blog: IBlog = {} as IBlog;

  relatedBlogs: IBlog[] = [];

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
    // Get the resolved data from the route
    this._route.data.subscribe({
      next: (data) => {
        const blogData = data['blogData'] as ISingleBlog;

        if (blogData) {
          this.blog = blogData.blog;
          this.relatedBlogs = blogData.blogs || [];
          console.log('Blog data loaded:', this.blog);
          console.log('all blogs:', blogData);
          console.log('Related blogs:', this.relatedBlogs);
        } else {
          console.error('No blog data available from resolver');
        }
      },
      error: (err) => {
        console.error('Error getting resolved blog data:', err);
      },
    });
  }
}
