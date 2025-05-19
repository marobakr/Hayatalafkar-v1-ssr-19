import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '@core/services/user/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@shared/alert/alert.service';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    ButtonComponent,
  ],
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css'],
})
export class ProfileDetailsComponent implements OnInit {
  private _fb = inject(FormBuilder);

  private _userService = inject(UserService);

  private _destroyRef = inject(DestroyRef);

  private _alertService = inject(AlertService);

  loginForm!: FormGroup;

  loading = signal(false);

  errorMessage = signal('');

  successMessage = signal('');

  ngOnInit(): void {
    this.initForm();
    this.getUserInfo();
  }

  initForm(): void {
    this.loginForm = this._fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  getUserInfo(): void {
    this.loading.set(true);
    this._userService
      .getUserInfo()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response && response.row) {
            console.log(response);
            this.populateForm(response.row);
          }
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error?.message || 'Error fetching user info');
          console.error('Error fetching user info:', error);
        },
      });
  }

  populateForm(userData: any): void {
    if (userData) {
      this.loginForm.patchValue({
        firstName: userData.name.split(' ')[0] || '',
        lastName: userData.name.split(' ')[1] || '',
        phoneNumber: userData.phone || '',
        email: userData.email || '',
      });
    }
  }

  submition(): void {
    if (this.loginForm.valid) {
      this.loading.set(true);
      const userData = this.loginForm.value;
      this._userService
        .updateUserInfo(userData)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (response) => {
            this.loading.set(false);
            this._alertService.showNotification({
              imagePath: '/images/common/settings.gif',
              translationKeys: {
                title: 'update_profile_success',
              },
            });
          },
        });
    } else {
      this.loginForm.markAllAsTouched();
      this.errorMessage.set('Please fill all required fields correctly');
      setTimeout(() => this.errorMessage.set(''), 3000);
    }
  }
}
