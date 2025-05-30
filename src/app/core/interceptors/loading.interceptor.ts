import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const spinner = inject(NgxSpinnerService);
  const router = inject(Router);

  // Get the current URL path
  const currentUrl = router.url;

  // Only show spinner if the current route matches these paths
  if (
    currentUrl.includes('/checkout/checkout-address') ||
    currentUrl.includes('/checkout/payment')
  ) {
    spinner.show();
  }

  return next(req).pipe(finalize(() => spinner.hide()));
};
