import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '@core/services/user/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService, AlertType } from '@shared/alert/alert.service';
import { ButtonComponent } from '@shared/components/button/button.component';
@Component({
  selector: 'app-password',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, ButtonComponent],
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css'],
})
export class PasswordComponent implements OnInit {
  fb = inject(FormBuilder);

  passwordForm!: FormGroup;

  private _userService = inject(UserService);

  private _destroyRef = inject(DestroyRef);

  private _alertService = inject(AlertService);

  ngOnInit(): void {
    this.initializeForm();
    this.getUserInfo();
  }

  private initializeForm(): void {
    this.passwordForm = this.fb.group(
      {
        phoneNumber: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        currentPassword: ['', [Validators.required]],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validator: this.passwordMatchValidator,
      }
    );
  }

  private getUserInfo(): void {
    this._userService
      .getUserInfo()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          if (response && response.row) {
            this.passwordForm.patchValue({
              phoneNumber: response.row.phone,
              email: response.row.email,
            });
          }
        },
        error: (error) => {
          console.error('Error fetching user info:', error);
        },
      });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    console.log(this.passwordForm.value);
    if (this.passwordForm.valid) {
      const finalData = {
        phone: this.passwordForm.value.phoneNumber,
        email: this.passwordForm.value.email,
        password: this.passwordForm.value.newPassword,
      };
      this._userService
        .updateUserInfo(finalData)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (response) => {
            this._alertService.show({
              title: 'Update Password',
              message: 'Are you sure you want to update your password?',
              confirmText: 'Update',
              cancelText: 'Cancel',
              alertType: AlertType.NOTIFICATION,
            });
          },
        });
    } else {
      // Handle form validation errors
      console.log('Form is invalid');
    }
  }

  // Helper methods for form validation
  get currentPassword() {
    return this.passwordForm.get('currentPassword');
  }

  get newPassword() {
    return this.passwordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.passwordForm.get('confirmPassword');
  }
}
