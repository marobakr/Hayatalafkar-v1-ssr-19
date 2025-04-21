import { CanActivateFn } from '@angular/router';

export const isLogInGuard: CanActivateFn = (route, state) => {
  return true;
};
