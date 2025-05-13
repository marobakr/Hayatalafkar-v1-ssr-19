import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ArticlesHeaderComponent } from '../../articles/components/articles-header/articles-header.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ArticlesHeaderComponent,
    ReactiveFormsModule,
    TranslateModule,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  private _router = inject(Router);

  ngOnInit(): void {
    // By default, navigate to the personal info tab
    // Check if we're at the root register path, then redirect to personal
    if (this._router.url.endsWith('/register')) {
      // this._router.navigate(['register/personal']);
    }
  }

  /**
   * Checks if the given route segment is active
   * @param route The route segment to check
   * @returns True if the route is active
   */
  isRouteActive(route: string): boolean {
    return this._router.url.includes(route);
  }
}
