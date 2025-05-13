import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

interface TokenData {
  token: string;
  expiresAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStorageService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  saveToken(token: string, expiresIn: number): void {
    if (!this.isBrowser) return;

    const expiresAt = new Date().getTime() + expiresIn * 1000;
    const tokenData: TokenData = { token, expiresAt };
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;

    const tokenDataStr = localStorage.getItem(this.TOKEN_KEY);
    if (!tokenDataStr) return null;

    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);

      // Check if token is expired
      if (new Date().getTime() > tokenData.expiresAt) {
        this.removeToken();
        return null;
      }

      return tokenData.token;
    } catch (error) {
      this.removeToken();
      return null;
    }
  }

  removeToken(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.removeToken();
    if (this.isBrowser) {
      this.router.navigate(['/']);
    }
  }
}
