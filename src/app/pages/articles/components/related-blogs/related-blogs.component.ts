import {
  animate,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { ApiService } from '@core/services/conf/api.service';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { SafeHtmlComponent } from '../../../../core/safe-html/safe-html.component';
import { IRelatedBlogs } from '../../res/interfaces/singleBlog';

@Component({
  selector: 'app-related-blogs',
  imports: [
    TranslateModule,
    AsyncPipe,
    RouterLink,
    CustomTranslatePipe,
    SafeHtmlComponent,
    NgClass,
    ImageUrlDirective,
  ],
  templateUrl: './related-blogs.component.html',
  styleUrl: './related-blogs.component.css',
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
    trigger('blogAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('100ms', [
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
    trigger('hoverAnimation', [
      state(
        'normal',
        style({
          transform: 'scale(1)',
          boxShadow: 'none',
        })
      ),
      state(
        'hovered',
        style({
          transform: 'scale(1.02)',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
        })
      ),
      transition('normal <=> hovered', animate('200ms ease-in-out')),
    ]),
    trigger('imageAnimation', [
      state(
        'normal',
        style({
          transform: 'scale(1)',
        })
      ),
      state(
        'hovered',
        style({
          transform: 'scale(1.1)',
        })
      ),
      transition('normal <=> hovered', animate('300ms ease-in-out')),
    ]),
  ],
})
export class RelatedBlogsComponent implements OnInit {
  _languageService = inject(LanguageService);

  _apiService = inject(ApiService);

  currentLang$ = this._languageService.getLanguage();

  @Input({ required: true }) lightLabel: boolean = true;

  @Input({ required: true }) relatedBlogs: IRelatedBlogs[] = [];

  // Track hover states
  blogHoverStates: { [key: number]: string } = {};
  imageHoverStates: { [key: number]: string } = {};

  ngOnInit(): void {
    // Initialize hover states for all blogs
    if (this.relatedBlogs) {
      this.relatedBlogs.forEach((blog) => {
        this.blogHoverStates[blog.id] = 'normal';
        this.imageHoverStates[blog.id] = 'normal';
      });
    }
  }

  onBlogMouseEnter(blogId: number): void {
    this.blogHoverStates[blogId] = 'hovered';
  }

  onBlogMouseLeave(blogId: number): void {
    this.blogHoverStates[blogId] = 'normal';
  }

  onImageMouseEnter(blogId: number): void {
    this.imageHoverStates[blogId] = 'hovered';
  }

  onImageMouseLeave(blogId: number): void {
    this.imageHoverStates[blogId] = 'normal';
  }
}
