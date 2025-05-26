import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthStorageService } from '../services/auth/auth-storage.service';
import { LanguageService } from '../services/lang/language.service';

export const unauthGuard: CanActivateFn = ():
  | boolean
  | UrlTree
  | Observable<boolean | UrlTree> => {
  const authStorageService = inject(AuthStorageService);
  const router = inject(Router);
  const languageService = inject(LanguageService);

  // Do a synchronous check first to avoid flashing
  if (!authStorageService.isAuthenticated()) {
    return true; // Allow access to login/register pages immediately
  }

  // User is authenticated, need to redirect away from login page
  // Just use the async path - it's a one-time redirect that won't cause flashing
  // since we've already determined the user is authenticated
  return languageService
    .getLanguage()
    .pipe(map((lang) => router.createUrlTree(['/', lang, 'home'])));
};
