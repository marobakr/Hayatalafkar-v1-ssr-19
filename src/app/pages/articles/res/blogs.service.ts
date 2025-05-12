import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';

@Injectable({
  providedIn: 'root',
})
export class BlogsService {
  apiService = inject(ApiService);

  getAllBlogs() {
    return this.apiService.get(API_CONFIG.BLOG.GET_ALL);
  }

  getBlogById(slug: string) {
    return this.apiService.get(API_CONFIG.BLOG.GET_SINGLE + slug);
  }
}
