import { animate, style, transition, trigger } from '@angular/animations';
import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/lang/language.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { TalentImageCardComponent } from '../../shared/components/talent-image-card/talent-image-card.component';
import { ArticlesHeaderComponent } from '../articles/components/articles-header/articles-header.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    ArticlesHeaderComponent,
    TranslateModule,
    TalentImageCardComponent,
    ButtonComponent,
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
  animations: [
    trigger('itemAnimation', [
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate(
          '300ms ease-out',
          style({
            transform: 'translateX(-100%)',
            opacity: 0,
            height: 0,
            margin: 0,
            padding: 0,
          })
        ),
      ]),
    ]),
    trigger('emptyWishlistAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '500ms ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          })
        ),
      ]),
    ]),
  ],
})
export class WishlistComponent {
  _translate = inject(TranslateService);
  _languageService = inject(LanguageService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  productsItem: string[] = [];
  cartAnimationStates: { [key: number]: boolean } = {};

  constructor() {
    // Fetch the proper language from the service
    this._languageService.getLanguage().subscribe((lang) => {
      // Fetch descriptions from translation file
      this._translate.use(lang).subscribe(() => {
        this._translate
          .get('wishlist.productsItem.commonItems')
          .subscribe((descriptions: string[]) => {
            console.log(descriptions);
            this.productsItem = descriptions;
          });
      });
    });
  }
  removeItem(index: number) {
    this.productsItem = this.productsItem.filter((_, i) => i !== index);
  }

  removeAllItems() {
    if (!this.isBrowser) {
      this.productsItem = [];
      return;
    }

    const items = document.querySelectorAll('.wishlist-item');
    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('removing');
      }, index * 100);
    });

    setTimeout(() => {
      this.productsItem = [];
    }, items.length * 100 + 300);
  }

  showCartAnimation(index: number) {
    this.cartAnimationStates[index] = true;
    setTimeout(() => {
      this.cartAnimationStates[index] = false;
    }, 1000);
  }
}
