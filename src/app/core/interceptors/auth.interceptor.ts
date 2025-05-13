import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStorageService } from '../services/auth/auth-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStorageService = inject(AuthStorageService);
  const token = authStorageService.getToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
