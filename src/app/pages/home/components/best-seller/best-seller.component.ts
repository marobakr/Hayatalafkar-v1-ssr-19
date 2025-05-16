import { AsyncPipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/lang/language.service';
import { LatestProduct } from '../../res/home.interfaces';
import { SharedBestSellerComponent } from './components/shared-best-seller/shared-best-seller.component';

@Component({
  selector: 'app-best-seller',
  standalone: true,
  imports: [SharedBestSellerComponent, TranslateModule, RouterLink, AsyncPipe],
  templateUrl: './best-seller.component.html',
  styleUrl: './best-seller.component.css',
})
export class BestSellerComponent {
  @Input({ required: true }) LatestProducts: LatestProduct[] = [];

  descriptions: string[] = [];

  currentLang$ = inject(LanguageService).getLanguage();

  _translate = inject(TranslateService);

  _languageService = inject(LanguageService);

  constructor() {
    this._languageService.getLanguage().subscribe((lang) => {
      this._translate.use(lang).subscribe(() => {
        this._translate
          .get('bestSelling.descriptions')
          .subscribe((descriptions: string[]) => {
            this.descriptions = descriptions;
          });
      });
    });
  }
}
