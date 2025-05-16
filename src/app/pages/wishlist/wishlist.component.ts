import { animate, style, transition, trigger } from '@angular/animations';
import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { IGetWishlist } from '@core/interfaces/wishlist.interfaces';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth/auth.service';
import { LanguageService } from '../../core/services/lang/language.service';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
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
    ImageUrlDirective,
    CustomTranslatePipe,
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
export class WishlistComponent implements OnInit {
  _translate = inject(TranslateService);
  _languageService = inject(LanguageService);
  _wishlistService = inject(WishlistService);
  _authService = inject(AuthService);
  _router = inject(Router);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  wishlistItem: IGetWishlist[] = [];
  cartAnimationStates: { [key: number]: boolean } = {};
  isLoading = true;
  private userId: number | null = null;

  ngOnInit(): void {
    // Get user ID if authenticated
    if (this._authService.isAuthenticated()) {
      const userData = this._authService.getUserData();
      if (userData && userData.id) {
        this.userId = userData.id;
        this.loadWishlistItems();
      } else {
        this.redirectToLogin();
      }
    } else {
      this.redirectToLogin();
    }
  }

  private redirectToLogin(): void {
    this._languageService.getLanguage().subscribe((lang: string) => {
      this._router.navigate(['/', lang, 'login']);
    });
  }

  loadWishlistItems(): void {
    if (!this.userId) {
      this.redirectToLogin();
      return;
    }

    this.isLoading = true;

    this._wishlistService.getWishlistItems(this.userId).subscribe({
      next: (response) => {
        // Check different possible response formats
        if (response && Array.isArray(response.wishs)) {
          this.wishlistItem = response.wishs;
        } else {
          this.wishlistItem = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading wishlist items:', error);
        this.wishlistItem = [];
        this.isLoading = false;

        // If unauthorized, redirect to login
        if (error.status === 401) {
          this.redirectToLogin();
        }
      },
    });
  }

  removeItem(wishId: number, index: number): void {
    this._wishlistService.removeFromWishlist(wishId).subscribe({
      next: () => {
        this.wishlistItem = this.wishlistItem.filter((_, i) => i !== index);
      },
      error: (error) => {
        console.error('Error removing item from wishlist:', error);

        // If unauthorized, redirect to login
        if (error.status === 401) {
          this.redirectToLogin();
        }
      },
    });
  }

  removeAllItems(): void {
    if (!this.isBrowser) {
      this.wishlistItem = [];
      return;
    }

    const items = document.querySelectorAll('.wishlist-item');
    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('removing');
      }, index * 100);
    });

    // Remove all items sequentially
    const removePromises = this.wishlistItem.map((item, index) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          if (item.id) {
            this._wishlistService.removeFromWishlist(item.id).subscribe({
              next: () => resolve(),
              error: (error) => {
                // If unauthorized, redirect to login
                if (error.status === 401) {
                  this.redirectToLogin();
                }
                resolve();
              },
            });
          } else {
            resolve();
          }
        }, index * 100);
      });
    });

    // After all items are removed, clear the array
    Promise.all(removePromises).then(() => {
      this.wishlistItem = [];
    });
  }

  showCartAnimation(index: number): void {
    this.cartAnimationStates[index] = true;
    setTimeout(() => {
      this.cartAnimationStates[index] = false;
    }, 1000);
  }
}
