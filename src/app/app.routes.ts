import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/ar', pathMatch: 'full' },

  /* Main layout */
  {
    path: ':lang',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout').then((c) => c.MainLayout),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      /* Home */
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then((c) => c.HomeComponent),
        data: { titleKey: 'routes.home' },
      },
      /* don't forget the title for products 🔻🔻🔻🔻🔻🔻🔻 */

      /* Wishlist */
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./pages/wishlist/wishlist.component').then(
            (c) => c.WishlistComponent
          ),
        data: { titleKey: 'routes.wishlist' },
      },
      /* Blogs */
      {
        path: 'blogs',
        loadComponent: () =>
          import('./pages/articles/articles.component').then(
            (c) => c.ArticlesComponent
          ),
        data: { titleKey: 'routes.blog' },
      },
      {
        path: 'blog/:slug',
        loadComponent: () =>
          import('./pages/blog/blog.component').then((c) => c.BlogComponent),
      },
      /* Shopping */
      {
        path: 'shopping',
        loadComponent: () =>
          import('./pages/shopping/shopping.component').then(
            (c) => c.ShoppingComponent
          ),
        data: { titleKey: 'routes.shopping' },
      },
      /* About Us  */
      {
        path: 'about-us',
        loadComponent: () =>
          import('./pages/about-us/about-us.component').then(
            (c) => c.AboutUsComponent
          ),
        data: { titleKey: 'routes.about' },
      },
      /* Contact Us */
      {
        path: 'contact-us',
        loadComponent: () =>
          import('./pages/contact-us/contact-us.component').then(
            (c) => c.ContactUsComponent
          ),
        data: { titleKey: 'routes.contact' },
      },
      /* Cart */
      {
        path: 'cart',
        loadComponent: () =>
          import('./pages/cart/cart.component').then((c) => c.CartComponent),
        data: { titleKey: 'routes.home' },
      },

      /* Profile */
      {
        path: 'profile',
        loadComponent: () =>
          import('../app/pages/profile/profile.component').then(
            (c) => c.ProfileComponent
          ),
        children: [
          { path: '', redirectTo: 'personal', pathMatch: 'full' },
          {
            path: 'personal',
            loadComponent: () =>
              import(
                '../app/pages/profile/components/profile-details/profile-details.component'
              ).then((c) => c.ProfileDetailsComponent),
          },
          {
            path: 'orders',
            loadComponent: () =>
              import(
                '../app/pages/profile/components/orders/orders.component'
              ).then((c) => c.OrdersComponent),
          },
          {
            path: 'address',
            loadComponent: () =>
              import(
                '../app/pages/profile/components/address/address.component'
              ).then((c) => c.AddressComponent),
          },
          {
            path: 'password',
            loadComponent: () =>
              import(
                '../app/pages/profile/components/password/password.component'
              ).then((c) => c.PasswordComponent),
          },
        ],
        data: {
          titleKey: 'routes.profile',
        },
      },
    ],
  },

  /* Auth layout */
  {
    path: ':lang',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout').then((c) => c.AuthLayout),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () =>
          import('../app/pages/auth/login/login.component').then(
            (c) => c.LoginComponent
          ),
        data: {
          titleKey: 'routes.login',
        },
      },
      {
        path: 'register',
        loadComponent: () =>
          import('../app/pages/auth/register/register.component').then(
            (c) => c.RegisterComponent
          ),
        children: [
          { path: '', redirectTo: 'personal', pathMatch: 'full' },
          {
            path: 'personal',
            loadComponent: () =>
              import(
                '../app/pages/auth/register/components/personal/personal.component'
              ).then((c) => c.PersonalComponent),
          },
          {
            path: 'password',
            loadComponent: () =>
              import(
                '../app/pages/auth/register/components/password/password.component'
              ).then((c) => c.PasswordComponent),
          },
          {
            path: 'address',
            loadComponent: () =>
              import(
                '../app/pages/auth/register/components/address/address.component'
              ).then((c) => c.AddressComponent),
          },
        ],
        data: {
          titleKey: 'routes.register',
        },
      },
    ],
  },

  // ✅ Catch all unknown child routes under :lang
  { path: '**', redirectTo: 'home' },
];
