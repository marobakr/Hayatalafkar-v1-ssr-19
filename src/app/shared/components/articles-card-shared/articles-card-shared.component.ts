import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { ApiService } from '@core/services/conf/api.service';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { IBlog } from 'src/app/pages/articles/res/interfaces/blogs';
import { SafeHtmlComponent } from '../../../core/safe-html/safe-html.component';
@Component({
  selector: 'app-articles-card-shared',
  standalone: true,
  imports: [
    NgClass,
    TranslateModule,
    CustomTranslatePipe,
    SafeHtmlComponent,
    RouterLink,
    AsyncPipe,
    ImageUrlDirective,
  ],
  templateUrl: './articles-card-shared.component.html',
  styleUrl: './articles-card-shared.component.css',
})
export class ArticlesCardSharedComponent {
  _apiService = inject(ApiService);

  _languageService = inject(LanguageService);

  currentLang$ = this._languageService.getLanguage();

  @Input({ required: true }) blogData: IBlog = {} as IBlog;
}
