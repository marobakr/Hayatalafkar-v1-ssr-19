import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  _apiService = inject(ApiService);

  getHomeData() {
    return this._apiService.get(API_CONFIG.HOME.GET);
  }
}
