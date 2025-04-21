import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isLogInGuard } from './is-log-in.guard';

describe('isLogInGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isLogInGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
