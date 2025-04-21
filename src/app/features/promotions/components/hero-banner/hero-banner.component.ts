import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { IBannerSlide } from '../../interfaces/IBannerSlide';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.css',
})
export class HeroBannerComponent {
  currentSlide = signal(0);

  slides = signal<IBannerSlide[]>([
    {
      id: 'special-gifts',
      title: 'Special Gifts Box',
      subtitle: 'For Your Love',
      startPrice: 'START $10.99',
      buttonText: 'Shop Now',
      buttonLink: '/products/gifts',
      image: '/images/promotions/2.webp',
    },
    {
      id: 'perfect-gifts',
      tag: 'BEST GIFT SHOP',
      title: 'Choose Perfect',
      highlightedText: 'Gifts',
      subtitle: 'From Us',
      description:
        'Culpa ducimus nesciunt aliquam non rerum esse recusandae omnis. Rerum optio dolores et.',
      buttonText: 'Shop Now',
      buttonLink: '/products/all',
      image: '/images/promotions/2.webp',
    },
  ]);

  nextSlide(): void {
    this.currentSlide.update((current) =>
      current === this.slides().length - 1 ? 0 : current + 1
    );
  }

  prevSlide(): void {
    this.currentSlide.update((current) =>
      current === 0 ? this.slides().length - 1 : current - 1
    );
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
  }
}
