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
import { isPlatformBrowser, NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  effect,
  HostBinding,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  runInInjectionContext,
  signal,
  ViewChild,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { AuthService } from '@core/services/auth/auth.service';
import { CartStateService } from '@core/services/cart/cart-state.service';
import { LanguageService } from '@core/services/lang/language.service';
import { WishlistService } from '@core/services/wishlist/wishlist.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AlertService } from '@shared/alert/alert.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ProductDetailsSkeletonComponent } from '@shared/components/skeleton/product-details-skeleton/product-details-skeleton.component';
import {
  CarouselComponent,
  CarouselModule,
  OwlOptions,
} from 'ngx-owl-carousel-o';
import { filter, Subscription, take } from 'rxjs';
import { SafeHtmlComponent } from '../../core/safe-html/safe-html.component';
import { ArticlesHeaderComponent } from '../articles/components/articles-header/articles-header.component';
import { SharedBestSellerComponent } from '../home/components/best-seller/components/shared-best-seller/shared-best-seller.component';
import { IAllProduct } from '../shopping/res/products.interface';
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
    SharedBestSellerComponent,
    NgClass,
    CustomTranslatePipe,
    ProductDetailsSkeletonComponent,
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
  host: { ngSkipHydration: 'true' },
})
export class ProductDetailsComponent
  implements AfterViewInit, OnInit, OnDestroy
{
  @HostBinding('class.rtl') get isRtl() {
    return this.isRtlMode();
  }

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

  _cartStateService = inject(CartStateService);

  _translateService = inject(TranslateService);

  private injector = inject(Injector);

  productDetails!: IProduct;

  relatedProducts: IAllProduct[] = [];

  currentPageUrl = '';

  isLoading = signal(false);

  // Direction for layout (RTL or LTR)
  isRtlMode = signal(false);

  // Selected size (string instead of number)
  selectedSize = signal<string>('');

  // Track the selected choice
  private selectedChoice = signal<any>(null);

  quantity = signal(1);

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
    rtl: false,
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
    rtl: false,
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
    { id: 'how_to_use', title: 'product_details.tabs.how_to_use' },
    { id: 'ingredient', title: 'product_details.tabs.ingredient' },
    { id: 'more_information', title: 'product_details.tabs.more_information' },
  ];

  // Active tab index
  activeTab = signal(0);

  /* Cart */
  isAddingToCart = signal(false);

  private destroyRef = inject(DestroyRef);
  private _titleService = inject(Title);
  private _metaService = inject(Meta);

  // Add subscription array to track and clean up subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    // Check language direction
    const langSub = this._languageService.getLanguage().subscribe((lang) => {
      this.isRtlMode.set(lang === 'ar');

      // Update carousel RTL setting based on language
      this.updateCarouselRtlSetting();

      // Update meta tags when language changes
      if (this.productDetails) {
        this.updateMetaTags(this.productDetails);
      }
    });
    this.subscriptions.push(langSub);

    this.subscriptResolverToProductDetails();
    this.processProductImages();
    if (this.isBrowser) {
      this.currentPageUrl = window.location.href;
    }

    if (this._authService.isAuthenticated()) {
      const userData = this._authService.getUserData();
      if (userData && userData.id) {
        this.userId = userData.id;
        if (this.productDetails && this.productDetails) {
          this.checkIfProductInWishlist();
          this.checkIfProductInCart();
        }
      }
    }

    // Create an effect that watches cart changes
    this.setupCartWatcher();

    // Set up router event subscription to update meta tags after navigation
    const routerSub = this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.productDetails) {
          this.updateMetaTags(this.productDetails);
        }
      });
    this.subscriptions.push(routerSub);
  }

  /**
   * Set up a watcher for cart changes
   */
  private setupCartWatcher(): void {
    // Use runInInjectionContext with the component's injector
    runInInjectionContext(this.injector, () => {
      effect(() => {
        // This will re-run whenever auth state or cart state changes
        if (this._authService.isAuthenticated() && this.productDetails?.id) {
          this.checkIfProductInCart();
        }
      });
    });
  }

  // Update carousel options when RTL mode changes
  private updateCarouselRtlSetting(): void {
    const isRtl = this.isRtlMode();

    const navTextForRtl = [
      '<i class="fa-solid fa-arrow-right"></i>',
      '<i class="fa-solid fa-arrow-left"></i>',
    ];

    const navTextForLtr = [
      '<i class="fa-solid fa-arrow-left"></i>',
      '<i class="fa-solid fa-arrow-right"></i>',
    ];

    this.mainCarouselOptions = {
      ...this.mainCarouselOptions,
      rtl: isRtl,
      navText: isRtl ? navTextForRtl : navTextForLtr,
    };

    this.thumbnailOptions = {
      ...this.thumbnailOptions,
      rtl: isRtl,
    };

    // Force update on carousel after setting RTL
    setTimeout(() => {
      if (this.mainCarousel) {
        try {
          // Trick to force carousel update - destroy and initialize again
          const mainElement = document.querySelector(
            '.carousel-wrapper .owl-carousel'
          );
          if (mainElement) {
            mainElement.classList.add('owl-refresh');
            setTimeout(() => {
              mainElement.classList.remove('owl-refresh');
            }, 10);
          }
        } catch (e) {
          console.error('Error refreshing main carousel', e);
        }
      }

      if (this.thumbnailCarousel) {
        try {
          // Trick to force carousel update - destroy and initialize again
          const thumbElement = document.querySelector(
            '.thumbnail-gallery .owl-carousel'
          );
          if (thumbElement) {
            thumbElement.classList.add('owl-refresh');
            setTimeout(() => {
              thumbElement.classList.remove('owl-refresh');
            }, 10);
          }
        } catch (e) {
          console.error('Error refreshing thumbnail carousel', e);
        }
      }
    }, 100);
  }

  /**
   * Subscribe to product details from resolver and update meta tags
   */
  subscriptResolverToProductDetails(): void {
    const routeSub = this._route.data.subscribe((next) => {
      this.productDetails = next['productDetails'].product;
      this.relatedProducts = next['productDetails'].relatedProducts;

      // Update meta tags once product details are loaded
      if (this.productDetails) {
        this.updateMetaTags(this.productDetails);
      }

      // Initialize the selected size from the first choice if available
      if (
        this.productDetails?.choices &&
        this.productDetails.choices.length > 0
      ) {
        const firstChoice = this.productDetails.choices[0];
        this.setSelectedSizeFromChoice(firstChoice);
      }

      // Add test images if none exist (for testing purposes)
      if (
        !this.productDetails.additional_images ||
        (Array.isArray(this.productDetails.additional_images) &&
          this.productDetails.additional_images.length === 0)
      ) {
        console.log('No additional images found, adding test images');
        // Adding test images with the same format as the main image
        this.productDetails.additional_images = [
          { img: this.productDetails.main_image } as any,
          { img: this.productDetails.main_image } as any,
        ];
      }
    });
    this.subscriptions.push(routeSub);
  }

  incrementQuantity(): void {
    this.quantity.update((qty) => qty + 1);
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((qty) => qty - 1);
    }
  }

  /**
   * Get the translated name of a choice
   */
  getChoiceName(choice: any): string {
    // First try to get from customTranslate
    if (choice) {
      let currentLang = 'ar'; // Default to Arabic
      // Get current language
      this._languageService
        .getLanguage()
        .pipe(take(1))
        .subscribe((lang) => {
          currentLang = lang;
        });

      if (currentLang === 'ar' && choice.ar_name) {
        return choice.ar_name;
      } else if (currentLang === 'en' && choice.en_name) {
        return choice.en_name;
      } else if (choice?.cuurent_value) {
        return choice?.cuurent_value;
      }
    }
    return '';
  }

  /**
   * Return the price of the currently selected choice
   */
  activeChoicePrice(): string {
    // If no choice is selected or choices don't exist, return 0
    if (
      !this.productDetails?.choices ||
      this.productDetails.choices.length === 0
    ) {
      return '0';
    }

    // Find the selected choice based on current selectedSize
    const currentSize = this.selectedSize();
    const choice = this.productDetails.choices.find(
      (c: any) =>
        c.cuurent_value === currentSize || this.getChoiceName(c) === currentSize
    );

    // Return the price of the selected choice or the first choice as default
    if (choice && (choice as any).price) {
      return (choice as any).price;
    } else if (
      this.productDetails.choices[0] &&
      (this.productDetails.choices[0] as any).price
    ) {
      return (this.productDetails.choices[0] as any).price;
    }

    return '0';
  }

  /**
   * Set selected size from a choice object
   */
  setSelectedSizeFromChoice(choice: any): void {
    this.selectedChoice.set(choice);
    const sizeName = this.getChoiceName(choice);
    if (sizeName) {
      this.selectedSize.set(sizeName);
    } else if (choice?.cuurent_value) {
      this.selectedSize.set(choice?.cuurent_value);
    }
  }

  setSelectedSize(size: string): void {
    this.selectedSize.set(size);
  }

  setActiveIndex(index: number): void {
    this.activeIndex.set(index);
    if (this.mainCarousel && this.processedImages().length > index) {
      const imageId = this.processedImages()[index].id;
      this.mainCarousel.to(`slide_${imageId}`);
    }
  }

  ngAfterViewInit(): void {
    // Add event listener to sync main carousel with thumbnails
    if (this.mainCarousel) {
      this.mainCarousel.translated.subscribe((event: any) => {
        // Check if event and event.id exist before trying to split
        if (event && event.id && typeof event.id === 'string') {
          const parts = event.id.split('_');
          if (parts.length > 1) {
            const slideIndex = parseInt(parts[1], 10);
            if (!isNaN(slideIndex) && slideIndex !== this.activeIndex()) {
              this.activeIndex.set(slideIndex);
            }
          }
        }
      });
    }

    // Apply RTL settings again after view initialization to ensure they're applied
    setTimeout(() => {
      this.updateCarouselRtlSetting();
    }, 0);
  }

  // Process product images from backend response
  processProductImages(): void {
    console.log('Processing product images');
    console.log(
      'Main Image:',
      this.productDetails && this.productDetails.main_image
    );

    const images: Array<{ id: number; url: string; alt: string }> = [];

    // Add main image as the first image
    if (this.productDetails && this.productDetails.main_image) {
      images.push({
        id: 0,
        url: this.productDetails.main_image,
        alt: 'Product main image',
      });
    }

    // Try to process actual additional images if they exist
    if (
      this.productDetails &&
      this.productDetails.additional_images &&
      Array.isArray(this.productDetails.additional_images) &&
      this.productDetails.additional_images.length > 0
    ) {
      try {
        // Go through the additional images
        this.productDetails.additional_images.forEach(
          (imgData: any, index: number) => {
            if (imgData && typeof imgData === 'object' && imgData.img) {
              images.push({
                id: index + 1,
                url: imgData.img,
                alt: `Additional image ${index + 1}`,
              });
            } else if (typeof imgData === 'string') {
              images.push({
                id: index + 1,
                url: imgData,
                alt: `Additional image ${index + 1}`,
              });
            }
          }
        );
      } catch (error) {
        console.error('Error processing additional images:', error);
      }
    }

    // Ensure we have at least 3 images for demo purposes by duplicating the main image
    if (
      images.length < 3 &&
      this.productDetails &&
      this.productDetails.main_image
    ) {
      // Add duplicate copies of the main image as additional images for the demo
      for (let i = images.length; i < 3; i++) {
        images.push({
          id: i,
          url: this.productDetails.main_image,
          alt: `Additional image ${i}`,
        });
      }
    }

    console.log('Final processed images:', images);
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
      if (this.productDetails.ar_name) {
        return this.productDetails.ar_name;
      } else if (this.productDetails.en_name) {
        return this.productDetails.en_name;
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
    if (!this.productDetails.id || !this.userId) {
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

    this._wishlistService.addToWishlist(this.productDetails.id).subscribe({
      next: () => {
        this.isInWishlist.set(true);
        this.isAddingToWishlist.set(false);
        this._wishlistService.loadWishlistCount();

        // Show success notification alert (no buttons)
        this._alertService.showNotification({
          imagePath: '/images/common/wishlist.webp',
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
          imagePath: '/images/common/error.webp',
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
    if (!this.isInWishlist() || !this.productDetails?.id) return;
    const wishId = this._wishlistService.getWishIdForProduct(
      this.productDetails.id
    );
    if (!wishId) return;

    // Show confirmation alert before removing
    this._alertService.showConfirmation({
      imagePath: '/images/common/before-remove.webp',
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
          imagePath: '/images/common/after-remove.webp',
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
          imagePath: '/images/common/before-remove.webp',
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
    if (!this.productDetails || !this.productDetails.id) return;

    // Check if product is in wishlist using service method
    const isInWishlist = this._wishlistService.isProductInWishlist(
      this.productDetails.id
    );

    // Get current wishlist items to ensure we're up to date
    this._wishlistService.loadWishlistCount();

    this.isInWishlist.set(isInWishlist);
    console.log(
      'Product in wishlist:',
      isInWishlist,
      'Product ID:',
      this.productDetails.id
    );
  }

  /* Cart */
  /**
   * Toggle cart: add or update product in cart based on current state
   * This function updates quantity rather than removing the item when it's already in cart
   */
  toggleCart(): void {
    if (this.isInCart()) {
      this.updateCartQuantity();
    } else {
      this.addToCart();
    }
  }

  /**
   * Check if product is in cart
   */
  isInCart(): boolean {
    if (!this.productDetails?.id) return false;
    return this._cartStateService.isProductInCart(this.productDetails.id);
  }

  /**
   * Check if product is in cart or currently being updated
   * This helps prevent UI flicker during cart operations
   */
  isInCartOrUpdating(): boolean {
    // If we're in the process of adding to cart, and it was previously in cart,
    // we should still show it as in cart
    if (this.isAddingToCart()) {
      return true;
    }
    return this.isInCart();
  }

  /**
   * Add the current product to cart
   */
  addToCart(): void {
    if (this.isAddingToCart()) return;

    // Check if user is authenticated
    if (!this._authService.isAuthenticated()) {
      this._languageService
        .getLanguage()
        .pipe(take(1))
        .subscribe((lang) => {
          this._router.navigate(['/', lang, 'login']);
        });
      return;
    }

    // Get product ID
    if (!this.productDetails || !this.productDetails.id) {
      console.error('Cannot add to cart: Product ID is missing');
      return;
    }

    this.isAddingToCart.set(true);

    // Use the prepareCartPayload helper to prepare the payload
    const payload = this.prepareCartPayload();

    // Call cart service to add item
    this._cartStateService.addToCart(payload).subscribe({
      next: () => {
        this.isAddingToCart.set(false);

        // Show success notification
        this._alertService.showNotification({
          imagePath: '/images/common/addtocart.webp',
          translationKeys: {
            title: 'alerts.cart.add_success.title',
          },
        });
      },
      error: (err) => {
        this.isAddingToCart.set(false);
        this.handleCartError(err);
      },
    });
  }

  /**
   * Update cart item quantity
   */
  updateCartQuantity(): void {
    if (!this.isInCart() || !this.productDetails?.id) return;
    if (this.isAddingToCart()) return;

    this.isAddingToCart.set(true);

    // Get the currently selected choice
    const choice = this.selectedChoice();

    // If a choice is selected and it's different from what's in the cart,
    // remove the old item and add a new one with the correct choice
    const cartItem = this._cartStateService.getCartItemForProduct(
      this.productDetails.id
    );
    if (cartItem && choice && choice.id) {
      const cartChoiceId = cartItem.product_choice_id;

      // If choice is different, remove the item and add a new one
      if (cartChoiceId !== choice.id) {
        this.executeRemoveFromCart(cartItem.id);
        // Add new item with correct choice after a short delay
        setTimeout(() => {
          this.addToCart();
        }, 300);
        return;
      }
    }

    // Otherwise just update the quantity
    this._cartStateService
      .updateQuantity(this.productDetails.id, this.quantity())
      .subscribe({
        next: () => {
          this.isAddingToCart.set(false);

          // Refresh the cart state to ensure UI is updated correctly
          this._cartStateService.fetchCart();

          // Show success notification
          this._alertService.showNotification({
            imagePath: '/images/common/addtocart.webp',
            translationKeys: {
              title: 'alerts.cart.update_success.title',
            },
          });
        },
        error: (err) => {
          this.isAddingToCart.set(false);
          this.handleCartError(err);
        },
      });
  }

  /**
   * Execute cart item removal after confirmation
   */
  private executeRemoveFromCart(detailId: number): void {
    this._cartStateService.removeItem(detailId).subscribe({
      next: () => {
        this.isAddingToCart.set(false);

        // Refresh the cart state
        this._cartStateService.fetchCart();

        // Show success notification
        this._alertService.showNotification({
          imagePath: '/images/common/after-remove.webp',
          translationKeys: {
            title: 'alerts.cart.remove_success.title',
          },
        });
      },
      error: (err) => {
        this.isAddingToCart.set(false);
        this.handleCartError(err);
      },
    });
  }

  /**
   * Common error handler for cart operations
   */
  private handleCartError(error: any): void {
    if (error.status === 401) {
      this._languageService
        .getLanguage()
        .pipe(take(1))
        .subscribe((lang: string) => {
          this._router.navigate(['/', lang, 'login']);
        });
    }

    // Show error notification
    this._alertService.showNotification({
      imagePath: '/images/common/before-remove.webp',
      translationKeys: {
        title: 'alerts.cart.error.title',
        message: 'alerts.cart.error.message',
      },
    });

    console.error('Cart operation error:', error);
  }

  /**
   * Check if the current product is already in user's cart
   */
  private checkIfProductInCart(): void {
    if (!this.productDetails || !this.productDetails.id) return;

    // If product is in cart, set the quantity to match what's in the cart
    if (this.isInCart()) {
      const cartItem = this._cartStateService.getCartItemForProduct(
        this.productDetails.id
      );
      if (cartItem && cartItem.quantity) {
        this.quantity.set(cartItem.quantity);
      }
    }
  }

  // Set active tab
  setActiveTab(index: number): void {
    this.activeTab.set(index);
  }

  /**
   * Check if a choice is currently active/selected
   */
  isChoiceActive(choice: any): boolean {
    if (!choice) return false;

    // Check if this is the currently selected choice by comparing with the stored selectedChoice
    const currentChoice = this.selectedChoice();
    if (currentChoice && currentChoice.id && choice.id) {
      return currentChoice.id === choice.id;
    }

    // Fallback to comparing by name if IDs don't match
    const choiceName = this.getChoiceName(choice);
    return this.selectedSize() === choiceName;
  }

  /**
   * Remove product from cart with confirmation
   */
  removeFromCart(): void {
    if (!this.isInCart() || !this.productDetails?.id) return;
    if (this.isAddingToCart()) return;

    // Get the cart item detail for this product
    const cartItem = this._cartStateService.getCartItemForProduct(
      this.productDetails.id
    );
    if (!cartItem) return;

    this.isAddingToCart.set(true);

    // Show confirmation alert before removing
    this._alertService.showConfirmation({
      imagePath: '/images/common/before-remove.webp',
      translationKeys: {
        title: 'alerts.cart.remove_confirm.title',
        message: 'alerts.cart.remove_confirm.message',
        confirmText: 'alerts.cart.remove_confirm.yes',
        cancelText: 'alerts.cart.remove_confirm.cancel',
      },
      onConfirm: () => {
        // Proceed with removal
        this.executeRemoveFromCart(cartItem.id);
      },
      onCancel: () => {
        this.isAddingToCart.set(false);
      },
    });
  }

  /**
   * Adds the product to cart and navigates to the cart page
   */
  buyNow(): void {
    // If product is already in cart, just navigate to cart
    if (this.isInCart()) {
      this._languageService
        .getLanguage()
        .pipe(take(1))
        .subscribe((lang: string) => {
          this._router.navigate(['/', lang, 'cart']);
        });
      return;
    }

    // Otherwise, add to cart then navigate
    this.isAddingToCart.set(true);

    const payload = this.prepareCartPayload();

    this._cartStateService.addToCart(payload).subscribe({
      next: () => {
        this.isAddingToCart.set(false);
        this._languageService
          .getLanguage()
          .pipe(take(1))
          .subscribe((lang: string) => {
            this._router.navigate(['/', lang, 'cart']);
          });
      },
      error: (error) => {
        this.handleCartError(error);
        this.isAddingToCart.set(false);
      },
    });
  }

  /**
   * Prepares the cart payload based on product selection
   * @returns The cart payload
   */
  private prepareCartPayload(): any {
    const productId = this.productDetails.id;
    const qty = this.quantity();

    // If there's a selected choice, include it in the payload
    if (this.selectedChoice()) {
      return {
        product_id: productId,
        quantity: qty,
        choice_id: this.selectedChoice().id,
      };
    }

    // Otherwise, just send product_id and quantity
    return {
      product_id: productId,
      quantity: qty,
    };
  }

  /**
   * Updates all meta tags (title and description) based on the current language
   */
  private updateMetaTags(product: IProduct): void {
    if (!product) return;

    const currentLang = this._translateService.currentLang;

    // Remove existing meta tags first
    this._metaService.removeTag("name='title'");
    this._metaService.removeTag("property='og:title'");
    this._metaService.removeTag("property='twitter:title'");
    this._metaService.removeTag("name='description'");
    this._metaService.removeTag("property='og:description'");
    this._metaService.removeTag("property='twitter:description'");
    this._metaService.removeTag("property='og:image'");
    this._metaService.removeTag("property='twitter:image'");

    // Set meta title
    const metaTitle =
      currentLang === 'en' ? product.en_meta_Title : product.ar_meta_Title;

    if (metaTitle && metaTitle.trim() !== '') {
      // Set document title
      this._titleService.setTitle(metaTitle);

      // Remove any fallback title that might have been set by the router
      const titleElement = document.querySelector('title');
      if (titleElement) {
        titleElement.textContent = metaTitle;
      }

      // Set meta tags for social sharing and SEO
      this._metaService.addTag({
        name: 'title',
        content: metaTitle,
      });
      this._metaService.addTag({
        property: 'og:title',
        content: metaTitle,
      });
      this._metaService.addTag({
        property: 'twitter:title',
        content: metaTitle,
      });
    } else {
      // Fallback to product name if no meta title is available
      const productName =
        currentLang === 'en' ? product.en_name : product.ar_name;
      if (productName) {
        this._titleService.setTitle(productName);

        this._metaService.addTag({
          name: 'title',
          content: productName,
        });
        this._metaService.addTag({
          property: 'og:title',
          content: productName,
        });
        this._metaService.addTag({
          property: 'twitter:title',
          content: productName,
        });
      }
    }

    // Set meta description
    const metaDescription =
      currentLang === 'en' ? product.en_meta_text : product.ar_meta_text;

    if (metaDescription && metaDescription.trim() !== '') {
      // Update meta description tags
      this._metaService.addTag({
        name: 'description',
        content: metaDescription,
      });
      this._metaService.addTag({
        property: 'og:description',
        content: metaDescription,
      });
      this._metaService.addTag({
        property: 'twitter:description',
        content: metaDescription,
      });
    }

    // Set image meta tags if available
    if (product.main_image) {
      const imageUrl = product.main_image;
      this._metaService.addTag({
        property: 'og:image',
        content: imageUrl,
      });
      this._metaService.addTag({
        property: 'twitter:image',
        content: imageUrl,
      });
    }
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
