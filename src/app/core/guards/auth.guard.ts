import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AlertService } from '@shared/alert/alert.service';
import { map } from 'rxjs';
import { AuthStorageService } from '../services/auth/auth-storage.service';
import { LanguageService } from '../services/lang/language.service';

export const authGuard: CanActivateFn = () => {
  const authStorageService = inject(AuthStorageService);
  const router = inject(Router);
  const languageService = inject(LanguageService);
  const alertService = inject(AlertService);
  return languageService.getLanguage().pipe(
    map((lang) => {
      if (authStorageService.isAuthenticated()) {
        return true;
      }
      alertService.showNotification({
        imagePath: '/images/common/unauth.webp',
        translationKeys: {
          title: 'unauth',
        },
      });
      return router.createUrlTree(['/', lang, 'login']);
    })
  );
};
