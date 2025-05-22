import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { AuthStorageService } from '../services/auth/auth-storage.service';
import { LanguageService } from '../services/lang/language.service';

export const authCheckResolver: ResolveFn<boolean> = () => {
  const authStorageService = inject(AuthStorageService);
  const router = inject(Router);
  const languageService = inject(LanguageService);

  let lang = '';
  languageService.getLanguage().subscribe((next) => (lang = next));

  if (authStorageService.isAuthenticated()) {
    // User is already authenticated, redirect to home
    router.navigate(['/', lang, 'home']);
    return false;
  }

  // User is not authenticated, allow access to auth pages
  return true;
};
