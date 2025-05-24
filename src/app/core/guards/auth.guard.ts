import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthStorageService } from '../services/auth/auth-storage.service';
import { LanguageService } from '../services/lang/language.service';

export const authGuard: CanActivateFn = () => {
  const authStorageService = inject(AuthStorageService);
  const router = inject(Router);
  const languageService = inject(LanguageService);

  return languageService.getLanguage().pipe(
    map((lang) => {
      if (authStorageService.isAuthenticated()) {
        return true;
      }
      return router.createUrlTree(['/', lang, 'login']);
    })
  );
};
