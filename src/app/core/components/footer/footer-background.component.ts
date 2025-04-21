import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-footer-background',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
    <img
      ngSrc="/images/footer/1.webp"
      width="1920"
      height="400"
      alt="Decorative footer background"
      class="absolute inset-0 w-full h-full object-cover -z-10"
      [priority]="false"
      loading="lazy"
    />
  `
})
export class FooterBackgroundComponent {}
