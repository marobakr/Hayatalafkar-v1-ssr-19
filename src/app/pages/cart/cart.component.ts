import { animate, style, transition, trigger } from '@angular/animations';
import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/service/lang/language.service';
import { ServiceCardComponent } from '../about-us/components/service-card/service-card.component';
import { ArticlesHeaderComponent } from '../articles/components/articles-header/articles-header.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [ArticlesHeaderComponent, TranslateModule, ServiceCardComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
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
    trigger('emptyCartAnimation', [
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
export class CartComponent {
  _translate = inject(TranslateService);
  _languageService = inject(LanguageService);

  productsItem: any[] = [];
  quantity: number = 3;

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
  incrementQuantity() {
    if (this.quantity < 100000) {
      this.quantity++;
    }
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  removeItem(index: number) {
    this.productsItem = this.productsItem.filter((_, i) => i !== index);
  }

  removeAllItems() {
    // Add removing class to all items
    const items = document.querySelectorAll('.cart-item');
    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('removing');
      }, index * 100); // Stagger the animation
    });

    // Clear the array after all animations complete
    setTimeout(() => {
      this.productsItem = [];
    }, items.length * 100 + 300);
  }
}
