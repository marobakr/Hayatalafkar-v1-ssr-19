import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/service/conf/auth.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  /* not Yet Import Resolver  */
  const _router = inject(Router);
  const _authService = inject(AuthService);
  if (_authService.authorization()) {
    return true;
  } else {
    return _router.createUrlTree(['login']);
  }
};
