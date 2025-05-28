import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const spinner = inject(NgxSpinnerService);

  // Don't show spinner for about-us related requests
  if (!req.url.includes('/api/about-us') || !req.url.includes('/api/home')) {
    spinner.show();
  }

  return next(req).pipe(
    finalize(() => {
      spinner.hide();
    })
  );
};
