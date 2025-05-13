import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStorageService } from '@core/services/auth/auth-storage.service';
import { API_CONFIG } from '@core/services/conf/api.config';
import { ApiService } from '@core/services/conf/api.service';
import { LanguageService } from '@core/services/lang/language.service';
import { Observable, tap } from 'rxjs';
import { ILogin, IRegister } from '../../interfaces/auth.interfaces';

interface AuthResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  _apiService = inject(ApiService);
  private http = inject(HttpClient);
  private baseUrl = API_CONFIG.BASE_URL;
  private authStorage = inject(AuthStorageService);
  private router = inject(Router);
  private languageService = inject(LanguageService);

  login(data: ILogin): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    return this.http
      .post<AuthResponse>(`${this.baseUrl}${API_CONFIG.AUTH.LOGIN}`, formData)
      .pipe(
        tap((response) => {
          if (response.access_token) {
            // Default expiration to 24 hours if not provided by backend
            const expiresIn = response.expires_in || 24 * 60 * 60;
            this.authStorage.saveToken(response.access_token, expiresIn);
          }
        })
      );
  }

  register(data: IRegister) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('password', data.password);

    return this.http.post(
      `${this.baseUrl}${API_CONFIG.AUTH.REGISTER}`,
      formData
    );
  }

  logout(): void {
    this.authStorage.logout();
    let lang = '';
    this.languageService.getLanguage().subscribe((next) => (lang = next));
    this.router.navigate(['/', lang]);
  }

  isAuthenticated(): boolean {
    return this.authStorage.isAuthenticated();
  }

  getToken(): string | null {
    return this.authStorage.getToken();
  }
}
