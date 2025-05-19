import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ProductsService } from '../../shopping/res/products.service';

export const productDetailsResolver: ResolveFn<Observable<any>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const productsService = inject(ProductsService);

  // Extract the id parameter from the route
  const productId = route.paramMap.get('id');

  return productsService.getProductById(productId || '');
};
