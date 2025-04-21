import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isUserGuard } from './is-user.guard';

describe('isUserGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isUserGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
