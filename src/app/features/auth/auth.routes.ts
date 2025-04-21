import { Routes } from "@angular/router";

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/sign-in/sign-in.component').then(
        (m) => m.SignInComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/sign-up/sign-up.component').then(
        (m) => m.SignUpComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./pages/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent
      ),
  },
  {
    path: 'create-account',
    loadComponent: () =>
      import('./pages/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent
      ),
  },
];
