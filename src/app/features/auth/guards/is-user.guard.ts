import { CanActivateFn } from '@angular/router';

export const isUserGuard: CanActivateFn = (route, state) => {
  return true;
};
