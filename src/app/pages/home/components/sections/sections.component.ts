import { Component, Input, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ICategory } from '@core/interfaces/common.model';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent } from '@shared/components/card/card.component';

@Component({
  selector: 'app-sections',
  standalone: true,
  imports: [CardComponent, TranslateModule, CustomTranslatePipe, RouterModule],
  templateUrl: './sections.component.html',
  styleUrl: './sections.component.css',
})
export class SectionsComponent implements OnInit {
  @Input({ required: true }) categories: ICategory[] = [];

  private languageService = inject(LanguageService);
  currentLang = 'en';

  ngOnInit() {
    // Subscribe to language changes
    this.languageService.getLanguage().subscribe((lang) => {
      this.currentLang = lang;
    });
  }
}
