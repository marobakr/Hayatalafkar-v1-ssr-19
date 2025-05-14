import { Component, inject, Input } from '@angular/core';
import { ICategory } from '@core/interfaces/common.model';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/lang/language.service';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
  selector: 'app-sections',
  standalone: true,
  imports: [CardComponent, TranslateModule, CustomTranslatePipe],
  templateUrl: './sections.component.html',
  styleUrl: './sections.component.css',
})
export class SectionsComponent {
  _translate = inject(TranslateService);

  _languageService = inject(LanguageService);

  @Input({ required: true }) categories: ICategory[] = [];

  /* Get Methods */
  getImagePath(image: string): string {
    return `/images/categories/${image}`;
  }
}
