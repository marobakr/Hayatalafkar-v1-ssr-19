import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { ApiService } from '@core/services/conf/api.service';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { IBlog } from 'src/app/pages/articles/res/blogs';
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
  ],
  templateUrl: './articles-card-shared.component.html',
  styleUrl: './articles-card-shared.component.css',
})
export class ArticlesCardSharedComponent {
  @Input({ required: true }) blogData: IBlog = {} as IBlog;

  _apiService = inject(ApiService);
  getImageUrl(image: string) {
    return this._apiService.getImageUrl(image, 'uploads/blogs');
  }

  _languageService = inject(LanguageService);
  currentLang$ = this._languageService.getLanguage();
}
