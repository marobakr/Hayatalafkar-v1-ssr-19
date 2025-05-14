import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { LanguageService } from '../../../../../core/services/lang/language.service';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

// Custom validator to check if passwords match
function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password?.value !== confirmPassword?.value) {
    confirmPassword?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }

  return null;
}

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    ButtonComponent,
    RouterLink,
    AsyncPipe,
  ],
  templateUrl: './personal.component.html',
  styleUrl: './personal.component.css',
})
export class PersonalComponent implements OnInit {
  private _fb = inject(FormBuilder);
  private _languageService = inject(LanguageService);
  private _authService = inject(AuthService);
  private _toastr = inject(ToastrService);
  private _router = inject(Router);

  currentLang$ = this._languageService.getLanguage();

  registerForm!: FormGroup;
  isLoading = false;

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.registerForm = this._fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        phone: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator }
    );
  }

  submition() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValues = this.registerForm.value;

    const registerData = {
      name: `${formValues.firstName} ${formValues.lastName}`,
      email: formValues.email,
      phone: formValues.phone,
      password: formValues.password,
    };

    this.isLoading = true;
    this._authService
      .register(registerData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: any) => {
          let lang = '';
          this._languageService.getLanguage().subscribe((next) => {
            lang = next;
          });
          if (response.user.message !== '') {
            this._router.navigate([`/${lang}/login`]);
            this._toastr.success('Registration successful');
          } else {
            this._toastr.error('Registration failed');
          }
        },
        error: (error) => {
          if (error?.error?.errors && typeof error.error.errors === 'object') {
            // Loop through all error keys in the response
            Object.keys(error.error.errors).forEach((key) => {
              const messages = error.error.errors[key];
              if (Array.isArray(messages)) {
                // Display each message for this key
                messages.forEach((message) => {
                  this._toastr.error(
                    message,
                    `${key.charAt(0).toUpperCase() + key.slice(1)} Error`
                  );
                });
              }
            });
          } else {
            // Fallback to the previous error handling if errors object is not present
            const errorMessage =
              error?.error?.message || 'Registration failed. Please try again.';
            this._toastr.error(errorMessage);
          }
        },
      });
  }

  // Helper methods for template
  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get phone() {
    return this.registerForm.get('phone');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
}
