import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { IGiftCategory } from '../../interfaces/IGiftCategory';
import { HeroBannerComponent } from "../hero-banner/hero-banner.component";

@Component({
  selector: 'app-gift-categories',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, HeroBannerComponent],
  templateUrl: './gift-categories.component.html',
})
export class GiftCategoriesComponent {
  categories = signal<IGiftCategory[]>([
    {
      id: 'awesome-gifts',
      title: 'Awesome Gifts Box Collections',
      tag: 'Gifts Box',
      image: '/images/promotions/4.webp',
      buttonText: 'Shop Now',
      buttonLink: '/products/gifts',
    },
    {
      id: 'occasion-gifts',
      title: 'Best Occasion Gifts Collections',
      tag: 'Occasion Gifts',
      image: '/images/promotions/3.webp',
      buttonText: 'Discover Now',
      buttonLink: '/products/occasion',
    },
    {
      id: 'combo-sets',
      title: 'Combo Sets Gift Box',
      tag: 'Occasion Gifts',
      discount: 'Up To 50% Off',
      image: '/images/promotions/4.webp',
      buttonText: 'Discover Now',
      buttonLink: '/products/combo-sets',
    },
    {
      id: 'combo-sets',
      title: 'Combo Sets Gift Box',
      tag: 'Occasion Gifts',
      discount: 'Up To 50% Off',
      image: '/images/promotions/1.webp',
      buttonText: 'Discover Now',
      buttonLink: '/products/combo-sets',
    },
  ]);
}
