import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ICategory } from '@core/interfaces/common.model';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { CommonService } from '@core/services/common/common.service';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslateModule, CustomTranslatePipe, RouterLink, AsyncPipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit {
  _commonService = inject(CommonService);

  _languageService = inject(LanguageService);

  _router = inject(Router);

  categories = signal<ICategory[]>([]);

  currentLang$ = this._languageService.getLanguage();

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories() {
    this._commonService.getAllCategories().subscribe((res: any) => {
      console.log(res);
      this.categories.set(res.categories);
    });
  }
}
