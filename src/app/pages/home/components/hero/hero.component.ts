import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/service/lang/language.service';
import { SloganComponent } from '../../../../shared/components/slogan/slogan.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [SloganComponent, TranslateModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  _languageService = inject(LanguageService);
  currentLang$ = this._languageService.getLanguage();
}
