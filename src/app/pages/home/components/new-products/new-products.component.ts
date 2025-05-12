import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/lang/language.service';
import { TalentImageCardComponent } from '../../../../shared/components/talent-image-card/talent-image-card.component';
import { SharedBestSellerComponent } from '../best-seller/components/shared-best-seller/shared-best-seller.component';

@Component({
  selector: 'app-new-products',
  standalone: true,
  imports: [
    SharedBestSellerComponent,
    TalentImageCardComponent,
    TranslateModule,
    AsyncPipe,
  ],
  templateUrl: './new-products.component.html',
  styleUrl: './new-products.component.css',
})
export class NewProductsComponent {
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
      offer: true,
    },
    {
      image: '/images/best-Seller/4.png',
      offer: true,
    },
    {
      image: '/images/best-Seller/5.png',
      offer: true,
    },
    {
      image: '/images/best-Seller/6.png',
      offer: true,
    },
  ];
}
