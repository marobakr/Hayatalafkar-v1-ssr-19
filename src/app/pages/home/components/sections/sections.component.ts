import { Component, inject, Input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/lang/language.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { Category } from '../../res/home.interfaces';

@Component({
  selector: 'app-sections',
  standalone: true,
  imports: [CardComponent, TranslateModule],
  templateUrl: './sections.component.html',
  styleUrl: './sections.component.css',
})
export class SectionsComponent {
  _translate = inject(TranslateService);
  _languageService = inject(LanguageService);

  titles: string[] = [];

  constructor() {
    this._languageService.getLanguage().subscribe((lang) => {
      this._translate.use(lang).subscribe(() => {
        this._translate.get('section.titles').subscribe((titles: string[]) => {
          console.log(titles);
          this.titles = titles;
        });
      });
    });
  }

  /* Get Methods */
  getImagePath(index: number): string {
    return `/images/categories/${index + 1}.png`;
  }

  /* Dynamic Inputs Properties */
  @Input({ required: true }) categories: Category[] = [];
}
