import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';
import { Observable } from 'rxjs';
import { IAboutUs } from './about-us.interface';

@Injectable({
  providedIn: 'root',
})
export class AboutUsService {
  apiService = inject(ApiService);

  getAboutUs(): Observable<IAboutUs> {
    return this.apiService.get<IAboutUs>(API_CONFIG.HOME.GET);
  }
}
