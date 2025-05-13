import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStorageService } from '../services/auth/auth-storage.service';
import { LanguageService } from '../services/lang/language.service';

export const authGuard: CanActivateFn = () => {
  const authStorageService = inject(AuthStorageService);
  const router = inject(Router);
  const languageService = inject(LanguageService);

  let lang = '';
  languageService.getLanguage().subscribe((next) => (lang = next));

  if (authStorageService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/', lang, 'auth', 'login']);
  return false;
};
