import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { SafeHtmlWithScriptsDirective } from '@core/directives/safe-html-with-script.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { SafeHtmlComponent } from '@core/safe-html/safe-html.component';
import { ApiService } from '@core/services/conf/api.service';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SectionHeadingComponent } from '@shared/components/section-heading/section-heading.component';
import { TalentImageCardComponent } from '@shared/components/talent-image-card/talent-image-card.component';
import { filter, Subscription } from 'rxjs';
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
    DatePipe,
    RouterLink,
    ImageUrlDirective,
  ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
})
export class BlogComponent implements OnInit, OnDestroy {
  _translate = inject(TranslateService);

  _languageService = inject(LanguageService);

  _route = inject(ActivatedRoute);

  _router = inject(Router);

  _apiService = inject(ApiService);

  _titleService = inject(Title);

  _metaService = inject(Meta);

  currentLanguage$ = inject(LanguageService).getLanguage();

  titles: string[] = [];

  blog: IBlog = {} as IBlog;

  relatedBlogs: IBlog[] = [];

  private subscriptions: Subscription[] = [];

  constructor() {}

  ngOnInit() {
    // Get the resolved data from the route
    const routeSub = this._route.data.subscribe({
      next: (data) => {
        const blogData = data['blogData'] as ISingleBlog;

        if (blogData) {
          this.blog = blogData.blog;
          this.relatedBlogs = blogData.blogs || [];

          // Update meta tags initially
          this.updateMetaTags(this.blog);

          // Subscribe to language changes to update meta tags
          const langSub = this._languageService.getLanguage().subscribe(() => {
            this.updateMetaTags(this.blog);
          });

          this.subscriptions.push(langSub);

          // Subscribe to router events to ensure title is updated after navigation
          const routerSub = this._router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
              this.updateMetaTags(this.blog);
            });

          this.subscriptions.push(routerSub);
        } else {
          console.error('No blog data available from resolver');
        }
      },
      error: (err) => {
        console.error('Error getting resolved blog data:', err);
      },
    });

    this.subscriptions.push(routeSub);
  }

  /**
   * Updates all meta tags (title and description) based on the current language
   */
  private updateMetaTags(blog: IBlog): void {
    if (!blog) return;

    const currentLang = this._translate.currentLang;

    // Remove existing meta tags first
    this._metaService.removeTag("name='title'");
    this._metaService.removeTag("property='og:title'");
    this._metaService.removeTag("property='twitter:title'");
    this._metaService.removeTag("name='description'");
    this._metaService.removeTag("property='og:description'");
    this._metaService.removeTag("property='twitter:description'");
    this._metaService.removeTag("property='og:image'");
    this._metaService.removeTag("property='twitter:image'");

    // Set meta title
    const metaTitle =
      currentLang === 'en' ? blog.en_meta_title : blog.ar_meta_title;

    if (metaTitle && metaTitle.trim() !== '') {
      // Set document title
      this._titleService.setTitle(metaTitle);

      // Remove any fallback title that might have been set by the router
      const titleElement = document.querySelector('title');
      if (titleElement) {
        titleElement.textContent = metaTitle;
      }

      // Set meta tags for social sharing and SEO
      this._metaService.addTag({
        name: 'title',
        content: metaTitle,
      });
      this._metaService.addTag({
        property: 'og:title',
        content: metaTitle,
      });
      this._metaService.addTag({
        property: 'twitter:title',
        content: metaTitle,
      });
    }

    // Set meta description
    const metaDescription =
      currentLang === 'en' ? blog.en_meta_text : blog.ar_meta_text;

    if (metaDescription && metaDescription.trim() !== '') {
      // Update meta description tags
      this._metaService.addTag({
        name: 'description',
        content: metaDescription,
      });
      this._metaService.addTag({
        property: 'og:description',
        content: metaDescription,
      });
      this._metaService.addTag({
        property: 'twitter:description',
        content: metaDescription,
      });
    }

    // Set image meta tags if available
    if (blog.main_image) {
      const imageUrl = blog.main_image;
      this._metaService.addTag({
        property: 'og:image',
        content: imageUrl,
      });
      this._metaService.addTag({
        property: 'twitter:image',
        content: imageUrl,
      });
    }
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
