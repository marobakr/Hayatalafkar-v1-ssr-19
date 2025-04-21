import { Component } from '@angular/core';
import { ProductCategoryListComponent } from "../../features/product/components/product-category-list/product-category-list.component";
import { GiftCategoriesComponent } from "../../features/promotions/components/gift-categories/gift-categories.component";

@Component({
  selector: 'app-home',
  imports: [ProductCategoryListComponent, GiftCategoriesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
