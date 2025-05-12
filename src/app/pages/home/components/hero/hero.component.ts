import { Component, inject, Input } from '@angular/core';
import { ApiService } from '@core/services/conf/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/lang/language.service';
import { SloganComponent } from '../../../../shared/components/slogan/slogan.component';
import { Slider } from '../../res/home.interfaces';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [SloganComponent, TranslateModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  @Input({ required: true }) heroSection: Slider[] = [];

  apiService = inject(ApiService);
  _languageService = inject(LanguageService);
  currentLang$ = this._languageService.getLanguage();

  getImageUrl(image: string): string {
    return this.apiService.getImageUrl(image, 'sliders');
  }
}
