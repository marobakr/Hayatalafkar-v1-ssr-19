import { inject, Injectable } from '@angular/core';
import { ICategory } from '@core/interfaces/common.model';
import { API_CONFIG } from './conf/api.config';
import { ApiService } from './conf/api.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  apiService = inject(ApiService);

  getAllCategories() {
    return this.apiService.get<ICategory>(API_CONFIG.CATEGORY.GET_ALL);
  }
}
