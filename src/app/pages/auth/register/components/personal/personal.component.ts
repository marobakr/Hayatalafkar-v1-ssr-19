import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { LanguageService } from '../../../../../core/services/lang/language.service';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

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
    this.registerForm = this._fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
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
          console.log(response);
          this._toastr.success('Registration successful');
          // After successful registration, navigate to the password tab
          // Store user data in localStorage or a service for multi-step form
          localStorage.setItem('register_data', JSON.stringify(registerData));

          // this._router.navigate([`/${lang}/register/password`]);
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
}
