import { inject, Injectable } from '@angular/core';
import { ICategory } from '@core/interfaces/common.model';
import { LatestProduct } from 'src/app/pages/home/res/home.interfaces';
import { API_CONFIG } from '../conf/api.config';
import { ApiService } from '../conf/api.service';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  apiService = inject(ApiService);

  getAllCategories() {
    return this.apiService.get<ICategory>(API_CONFIG.CATEGORY.GET_ALL);
  }

  getLatestProduct() {
    return this.apiService.get<LatestProduct>(API_CONFIG.HOME.GET);
  }
}
