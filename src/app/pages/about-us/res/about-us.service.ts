import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';
import { Observable } from 'rxjs';
import { IAboutUsOne, IAboutUsTwo } from './about-us.interface';

@Injectable({
  providedIn: 'root',
})
export class AboutUsService {
  apiService = inject(ApiService);

  getAboutUs(): Observable<IAboutUsOne> {
    return this.apiService.get<IAboutUsOne>(API_CONFIG.HOME.GET);
  }

  getAboutData(): Observable<IAboutUsTwo> {
    return this.apiService.get<IAboutUsTwo>(API_CONFIG.STATIC_PAGES.ABOUT_US);
  }
}
