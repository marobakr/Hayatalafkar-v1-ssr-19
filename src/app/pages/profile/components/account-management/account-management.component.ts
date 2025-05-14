import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { LanguageService } from '../../../../core/services/lang/language.service';
import { UserService } from '../../../../core/services/user/user.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  template: `
    <div class="pb-8">
      <h2 class="text-2xl font-bold mb-6">
        {{ 'account_management.title' | translate }}
      </h2>

      <!-- Loading indicator -->
      <div *ngIf="loading()" class="flex justify-center items-center py-4">
        <div
          class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"
        ></div>
      </div>

      <!-- Error message -->
      <div
        *ngIf="errorMessage()"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
      >
        {{ errorMessage() }}
      </div>

      <!-- Success message -->
      <div
        *ngIf="successMessage()"
        class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
      >
        {{ successMessage() }}
      </div>

      <!-- Account actions -->
      <div class="flex flex-col space-y-6">
        <!-- Deactivate account -->
        <div class="p-4 border border-yellow-300 rounded-lg bg-yellow-50">
          <h3 class="text-xl font-semibold text-yellow-700 mb-2">
            {{ 'account_management.deactivate_title' | translate }}
          </h3>
          <p class="mb-4 text-yellow-600">
            {{ 'account_management.deactivate_description' | translate }}
          </p>
          <app-button
            [title]="'account_management.deactivate_button' | translate"
            (click)="deactivateAccount()"
            [py]="'py-[9px]'"
            [px]="'px-[16px]'"
            [type]="'button'"
          ></app-button>
        </div>

        <!-- Delete account -->
        <div class="p-4 border border-red-300 rounded-lg bg-red-50">
          <h3 class="text-xl font-semibold text-red-700 mb-2">
            {{ 'account_management.delete_title' | translate }}
          </h3>
          <p class="mb-4 text-red-600">
            {{ 'account_management.delete_description' | translate }}
          </p>
          <app-button
            [title]="'account_management.delete_button' | translate"
            (click)="deleteAccount()"
            [py]="'py-[9px]'"
            [px]="'px-[16px]'"
            [type]="'button'"
          ></app-button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AccountManagementComponent {
  private _userService = inject(UserService);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _destroyRef = inject(DestroyRef);

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  deactivateAccount(): void {
    if (
      confirm(
        'Are you sure you want to deactivate your account? You can reactivate it later.'
      )
    ) {
      this.loading.set(true);
      this._userService
        .deactivateUser()
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.successMessage.set('Your account has been deactivated.');

            // Log out the user after deactivation
            setTimeout(() => {
              this._authService.logout().subscribe(() => {
                // Navigate to home page after logout
                let lang = '';
                this._languageService
                  .getLanguage()
                  .subscribe((l) => (lang = l));
                this._router.navigate(['/', lang]);
              });
            }, 2000);
          },
          error: (error) => {
            this.loading.set(false);
            this.errorMessage.set(
              error?.message || 'Error deactivating account'
            );
            console.error('Error deactivating account:', error);
            setTimeout(() => this.errorMessage.set(''), 3000);
          },
        });
    }
  }

  deleteAccount(): void {
    if (
      confirm(
        'Are you absolutely sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      // Double confirmation for permanent deletion
      if (
        confirm(
          'All your data will be permanently deleted. This action CANNOT be undone. Continue?'
        )
      ) {
        this.loading.set(true);
        this._userService
          .deleteUser()
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe({
            next: () => {
              this.loading.set(false);
              this.successMessage.set(
                'Your account has been permanently deleted.'
              );

              // Log out the user after deletion
              setTimeout(() => {
                this._authService.logout().subscribe(() => {
                  // Navigate to home page after logout
                  let lang = '';
                  this._languageService
                    .getLanguage()
                    .subscribe((l) => (lang = l));
                  this._router.navigate(['/', lang]);
                });
              }, 2000);
            },
            error: (error) => {
              this.loading.set(false);
              this.errorMessage.set(error?.message || 'Error deleting account');
              console.error('Error deleting account:', error);
              setTimeout(() => this.errorMessage.set(''), 3000);
            },
          });
      }
    }
  }
}
