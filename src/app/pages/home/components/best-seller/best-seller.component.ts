import { Component, inject, Input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/lang/language.service';
import { LatestProduct } from '../../res/home.interfaces';
import { SharedBestSellerComponent } from './components/shared-best-seller/shared-best-seller.component';

@Component({
  selector: 'app-best-seller',
  standalone: true,
  imports: [SharedBestSellerComponent, TranslateModule],
  templateUrl: './best-seller.component.html',
  styleUrl: './best-seller.component.css',
})
export class BestSellerComponent {
  @Input({ required: true }) LatestProducts: LatestProduct[] = [];

  descriptions: string[] = [];

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

  imageSrc: {
    image: string;
    offer: boolean;
  }[] = [
    {
      image: '/images/best-Seller/1.png',
      offer: true,
    },
    {
      image: '/images/best-Seller/2.png',
      offer: true,
    },
    {
      image: '/images/best-Seller/3.png',
      offer: false,
    },
    {
      image: '/images/best-Seller/4.png',
      offer: false,
    },
    {
      image: '/images/best-Seller/5.png',
      offer: false,
    },
    {
      image: '/images/best-Seller/6.png',
      offer: false,
    },
  ];
}
