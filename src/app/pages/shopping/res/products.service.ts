import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  apiService = inject(ApiService);

  getAllProducts() {
    return this.apiService.get(API_CONFIG.PRODUCTS.GET_ALL);
  }

  getProductById(slug: string) {
    return this.apiService.get(API_CONFIG.PRODUCTS.GET_WITH_SLUG + slug);
  }

  // getProductByCategory(slug: string) {
  //   return this.apiService.get(API_CONFIG.PRODUCTS.GET_WITH_CATEGORY + slug);
  // }

  // getProductBySubcategory(slug: string) {
  //   return this.apiService.get(API_CONFIG.PRODUCTS.GET_WITH_SUBCATEGORY + slug);
  // }
}
