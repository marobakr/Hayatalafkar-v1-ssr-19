import { Component, signal } from '@angular/core';
import { ProductCategory } from '../../interfaces/IProductCategory';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
@Component({
  selector: 'app-product-category-list',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './product-category-list.component.html',
  styleUrl: './product-category-list.component.css',
})
export class ProductCategoryListComponent {
  categories = signal<ProductCategory[]>([
    {
      id: 'gifts',
      name: 'Gifts Box',
      icon: '/images/icons/1.png',
      itemCount: 30,
      route: '/products/gifts',
    },
    {
      id: 'home-living',
      name: 'Home & Living Gifts',
      icon: '/images/icons/2.png',
      itemCount: 25,
      route: '/products/home-living',
    },
    {
      id: 'jewelry',
      name: 'Jewelry & Accessories',
      icon: '/images/icons/3.png',
      itemCount: 15,
      route: '/products/jewelry',
    },
    {
      id: 'garment',
      name: 'Garment Care',
      icon: '/images/icons/4.png',
      itemCount: 65,
      route: '/products/garment',
    },
    {
      id: 'office',
      name: 'Office & Stationery',
      icon: '/images/icons/5.png',
      itemCount: 30,
      route: '/products/office',
    },
  ]);
}
