import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { LanguageService } from '../services/lang/language.service';

export const publicGuard: CanActivateFn = () => {
  const router = inject(Router);
  const languageService = inject(LanguageService);

  // Fast check - if token exists, redirect to home
  if (localStorage.getItem('auth_token') != null) {
    return languageService
      .getLanguage()
      .pipe(map((lang) => router.createUrlTree(['/', lang, 'home'])));
  }

  // No token, allow access to login/register
  return true;
};
