import {
  animate,
  group,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { AuthService } from '@core/services/auth/auth.service';
import { LanguageService } from '@core/services/lang/language.service';
import { WishlistService } from '@core/services/wishlist/wishlist.service';
import { TranslateModule } from '@ngx-translate/core';
import {
  CarouselComponent,
  CarouselModule,
  OwlOptions,
} from 'ngx-owl-carousel-o';
import { take } from 'rxjs';
import { SafeHtmlComponent } from '../../core/safe-html/safe-html.component';
import { AlertService } from '../../shared/alert/alert.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ArticlesHeaderComponent } from '../articles/components/articles-header/articles-header.component';
import { ProductsService } from '../shopping/res/products.service';
import { IProduct } from './res/productDetails.interface';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    LoadingComponent,
    ArticlesHeaderComponent,
    TranslateModule,
    CarouselModule,
    ImageUrlDirective,
    RouterLink,
    CustomTranslatePipe,
    SafeHtmlComponent,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('filterAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '350ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('productGridAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('50ms', [
              animate(
                '400ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('badgeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.8)' })
        ),
      ]),
    ]),
    trigger('chipAnimation', [
      transition(':enter', [
        style({ opacity: 0, width: 0, marginRight: 0 }),
        group([
          animate('300ms ease', style({ opacity: 1 })),
          animate('300ms ease', style({ width: '*' })),
          animate('300ms ease', style({ marginRight: '*' })),
        ]),
      ]),
      transition(':leave', [
        group([
          animate('200ms ease', style({ opacity: 0 })),
          animate('200ms ease', style({ width: 0 })),
          animate('200ms ease', style({ marginRight: 0 })),
        ]),
      ]),
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
    trigger('cardHover', [
      state(
        'normal',
        style({
          transform: 'translateY(0)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        })
      ),
      state(
        'hovered',
        style({
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.15)',
        })
      ),
      transition('normal <=> hovered', animate('200ms ease-in-out')),
    ]),
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateY(20px)' })
        ),
      ]),
    ]),
  ],
})
export class ProductDetailsComponent implements AfterViewInit, OnInit {
  @ViewChild('mainCarousel') mainCarousel!: CarouselComponent;
  @ViewChild('thumbnailCarousel') thumbnailCarousel!: CarouselComponent;

  private userId: number | null = null;

  private _languageService = inject(LanguageService);

  private platformId = inject(PLATFORM_ID);

  private isBrowser = isPlatformBrowser(this.platformId);

  private _authService = inject(AuthService);

  private _router = inject(Router);

  _route = inject(ActivatedRoute);

  _productsService = inject(ProductsService);

  productDetails: IProduct = this._route.snapshot.data['productDetails'];

  currentPageUrl = '';

  isLoading = signal(false);

  selectedSize = signal('30 مل');

  quantity = signal(4);

  activeIndex = signal(0);

  // Process product images
  processedImages = signal<Array<{ id: number; url: string; alt: string }>>([]);

  // Main carousel options
  mainCarouselOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    items: 1,
    autoplay: false,
    nav: true,
    navText: [
      '<i class="fa fa-chevron-left"></i>',
      '<i class="fa fa-chevron-right"></i>',
    ],
  };

  // Thumbnail gallery options
  thumbnailOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    items: 4,
    autoplay: false,
    nav: false,
    margin: 10,
    responsive: {
      0: {
        items: 3,
      },
      768: {
        items: 4,
      },
    },
  };

  // Product tabs configuration
  productTabs = [
    { id: 'description', title: 'product_details.tabs.description' },
    { id: 'additional', title: 'product_details.tabs.additional_info' },
    { id: 'reviews', title: 'product_details.tabs.reviews' },
  ];

  // Active tab index
  activeTab = signal(0);

  ngOnInit(): void {
    this.processProductImages();
    if (this.isBrowser) {
      this.currentPageUrl = window.location.href;
    }

    if (this._authService.isAuthenticated()) {
      const userData = this._authService.getUserData();
      if (userData && userData.id) {
        this.userId = userData.id;
        if (this.productDetails && this.productDetails.product[0].id) {
          this.checkIfProductInWishlist();
          // No need to call a method to check/set isInCart, computed signal handles it.
        }
      }
    }
  }

  incrementQuantity(): void {
    this.quantity.update((qty) => qty + 1);
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((qty) => qty - 1);
    }
  }

  setSelectedSize(size: string): void {
    this.selectedSize.set(size);
  }

  setActiveIndex(index: number): void {
    this.activeIndex.set(index);
    if (this.mainCarousel) {
      this.mainCarousel.to(`slide_${index}`);
    }
  }

  ngAfterViewInit(): void {
    // Add event listener to sync main carousel with thumbnails
    if (this.mainCarousel) {
      this.mainCarousel.translated.subscribe((event: any) => {
        const slideId = event.id; // Format: 'slide_X'
        const slideIndex = parseInt(slideId.split('_')[1], 10);

        if (!isNaN(slideIndex) && slideIndex !== this.activeIndex()) {
          this.activeIndex.set(slideIndex);
        }
      });
    }
  }

  // Process product images from backend response
  processProductImages(): void {
    const images: Array<{ id: number; url: string; alt: string }> = [];
    // Add main image as the first image
    if (this.productDetails && this.productDetails.product[0].main_image) {
      images.push({
        id: 0,
        url: this.productDetails.product[0].main_image,
        alt: 'Product main image',
      });
    }

    // Add additional images if they exist
    if (
      this.productDetails &&
      this.productDetails.product[0].additional_images &&
      Array.isArray(this.productDetails.product[0].additional_images) &&
      this.productDetails.product[0].additional_images.length > 0
    ) {
      // Process additional images array
      this.productDetails.product[0].additional_images.forEach(
        (additionalImageGroup: any, groupIndex: number) => {
          if (Array.isArray(additionalImageGroup)) {
            additionalImageGroup.forEach(
              (imageObj: any, imageIndex: number) => {
                if (imageObj && imageObj.img) {
                  images.push({
                    id: (groupIndex + 1) * 100 + imageIndex,
                    url: imageObj.img,
                    alt: `Additional image ${
                      (groupIndex + 1) * 100 + imageIndex
                    }`,
                  });
                }
              }
            );
          }
        }
      );
    }

    // If no images were found, add the main image as a fallback
    if (images.length === 0 && this.productDetails) {
      images.push({
        id: 0,
        url: this.productDetails.product[0].main_image || '',
        alt: 'Product image',
      });
    }

    this.processedImages.set(images);
  }

  // Social media sharing methods
  shareOnFacebook(): void {
    if (!this.isBrowser) return;

    const productTitle = this.getProductTitle();
    const url = encodeURIComponent(this.currentPageUrl);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(
      productTitle
    )}`;

    this.openShareWindow(shareUrl);
  }

  shareOnTwitter(): void {
    if (!this.isBrowser) return;

    const productTitle = this.getProductTitle();
    const url = encodeURIComponent(this.currentPageUrl);
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      productTitle
    )}&url=${url}`;

    this.openShareWindow(shareUrl);
  }

  shareOnWhatsApp(): void {
    if (!this.isBrowser) return;

    const productTitle = this.getProductTitle();
    const url = encodeURIComponent(this.currentPageUrl);
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      productTitle + ' ' + this.currentPageUrl
    )}`;

    this.openShareWindow(shareUrl);
  }

  private getProductTitle(): string {
    // Get product title based on available data
    if (this.productDetails) {
      // Get localized property based on product details
      if (this.productDetails.product[0].ar_name) {
        return this.productDetails.product[0].ar_name;
      } else if (this.productDetails.product[0].en_name) {
        return this.productDetails.product[0].en_name;
      } else {
        return 'Product';
      }
    }
    return 'Product';
  }

  private openShareWindow(url: string): void {
    window.open(
      url,
      'share-popup',
      'height=500,width=600,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes'
    );
  }

  /* Wishlist */
  _wishlistService = inject(WishlistService);
  _alertService = inject(AlertService);

  isAddingToWishlist = signal(false);
  isInWishlist = signal(false);

  addToWishlist(): void {
    if (this.isInWishlist() || this.isAddingToWishlist()) return;
    if (!this.productDetails?.product[0].id || !this.userId) {
      if (!this.userId) {
        this._languageService
          .getLanguage()
          .pipe(take(1))
          .subscribe((lang) => {
            this._router.navigate(['/', lang, 'login']);
          });
      }
      return;
    }
    this.isAddingToWishlist.set(true);

    this._wishlistService
      .addToWishlist(this.productDetails.product[0].id)
      .subscribe({
        next: () => {
          this.isInWishlist.set(true);
          this.isAddingToWishlist.set(false);
          this._wishlistService.loadWishlistCount();

          // Show success notification alert (no buttons)
          this._alertService.showNotification({
            imagePath: '/images/common/wishlist.gif',
            translationKeys: {
              title: 'alerts.wishlist.add_success.title',
            },
          });
        },
        error: (err) => {
          this.isAddingToWishlist.set(false);
          if (err.status === 401) {
            this._languageService
              .getLanguage()
              .pipe(take(1))
              .subscribe((lang) => {
                this._router.navigate(['/', lang, 'login']);
              });
          }

          // Show error notification
          this._alertService.showNotification({
            imagePath: '/images/common/error.png',
            translationKeys: {
              title: 'alerts.wishlist.add_error.title',
              message: 'alerts.wishlist.add_error.message',
            },
          });
          console.error('Error adding to wishlist:', err);
        },
      });
  }

  removeFromWishlist(): void {
    if (!this.isInWishlist() || !this.productDetails?.product[0].id) return;
    const wishId = this._wishlistService.getWishIdForProduct(
      this.productDetails.product[0].id
    );
    if (!wishId) return;

    // Show confirmation alert before removing
    this._alertService.showConfirmation({
      imagePath: '/images/common/remove.gif',
      translationKeys: {
        title: 'alerts.wishlist.remove_confirm.title',
        message: 'alerts.wishlist.remove_confirm.message',
        confirmText: 'alerts.wishlist.remove_confirm.yes',
        cancelText: 'alerts.wishlist.remove_confirm.cancel',
      },
      onConfirm: () => {
        // Proceed with removal
        this.executeRemoveFromWishlist(wishId);
      },
    });
  }

  // Actual removal from wishlist after confirmation
  private executeRemoveFromWishlist(wishId: number): void {
    this.isAddingToWishlist.set(true);

    this._wishlistService.removeFromWishlist(wishId).subscribe({
      next: () => {
        this.isInWishlist.set(false);
        this.isAddingToWishlist.set(false);
        this._wishlistService.loadWishlistCount();

        // Show success notification (without buttons)
        this._alertService.showNotification({
          imagePath: '/images/common/remove.gif',
          translationKeys: {
            title: 'alerts.wishlist.remove_success.title',
          },
        });
      },
      error: (err) => {
        this.isAddingToWishlist.set(false);
        if (err.status === 401) {
          this._languageService
            .getLanguage()
            .pipe(take(1))
            .subscribe((lang) => {
              this._router.navigate(['/', lang, 'login']);
            });
        }

        // Show error notification
        this._alertService.showNotification({
          imagePath: '/images/common/before-remove.png',
          translationKeys: {
            title: 'alerts.wishlist.remove_error.title',
            message: 'alerts.wishlist.remove_error.message',
          },
        });
        console.error('Error removing from wishlist:', err);
      },
    });
  }

  private checkIfProductInWishlist(): void {
    if (!this.productDetails || !this.productDetails.product[0].id) return;
    const isInWishlist = this._wishlistService.isProductInWishlist(
      this.productDetails.product[0].id
    );
    this.isInWishlist.set(isInWishlist);
  }

  // Set active tab
  setActiveTab(index: number): void {
    this.activeTab.set(index);
  }
}
