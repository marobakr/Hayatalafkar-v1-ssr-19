import {
  animate,
  keyframes,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
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
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@shared/alert/alert.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
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
  animations: [
    trigger('formAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '500ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('fieldAnimation', [
      transition(':enter', [
        query(
          '.flex-grow-1, div[class*=mb-]',
          [
            style({ opacity: 0, transform: 'translateY(15px)' }),
            stagger(80, [
              animate(
                '400ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('iconAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5) rotate(-10deg)' }),
        animate(
          '600ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          style({ opacity: 1, transform: 'scale(1) rotate(0deg)' })
        ),
      ]),
    ]),
    trigger('pulse', [
      transition(':enter', [
        animate(
          '1s',
          keyframes([
            style({ transform: 'scale(1)', offset: 0 }),
            style({ transform: 'scale(1.05)', offset: 0.5 }),
            style({ transform: 'scale(1)', offset: 1.0 }),
          ])
        ),
      ]),
    ]),
    trigger('shake', [
      state(
        'idle',
        style({
          transform: 'translateX(0)',
        })
      ),
      state(
        'shake',
        style({
          transform: 'translateX(0)',
        })
      ),
      transition('idle => shake', [
        animate('50ms', style({ transform: 'translateX(-10px)' })),
        animate('100ms', style({ transform: 'translateX(10px)' })),
        animate('100ms', style({ transform: 'translateX(-10px)' })),
        animate('100ms', style({ transform: 'translateX(10px)' })),
        animate('50ms', style({ transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class PersonalComponent implements OnInit {
  private _fb = inject(FormBuilder);
  private _languageService = inject(LanguageService);
  private _authService = inject(AuthService);
  private _toastr = inject(ToastrService);
  private _router = inject(Router);
  private _alertService = inject(AlertService);
  currentLang$ = this._languageService.getLanguage();

  registerForm!: FormGroup;
  isLoading = false;

  // Animation state
  shakeState = signal('idle');

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
      this.triggerShakeAnimation();
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
            this._alertService.showNotification({
              imagePath: '/images/common/settings.gif',
              translationKeys: {
                title: 'Registration_successful',
              },
            });
            this._router.navigate([`/${lang}/login`]);
          } else {
            this._alertService.showNotification({
              imagePath: '/images/common/before-remove.png',
              translationKeys: {
                title: 'Registration failed',
              },
            });
            this.triggerShakeAnimation();
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
                  this._alertService.showNotification({
                    imagePath: '/images/common/before-remove.png',
                    translationKeys: {
                      title: message,
                    },
                  });
                });
              }
            });
          } else {
            this._alertService.showNotification({
              imagePath: '/images/common/before-remove.png',
              translationKeys: {
                title: 'Registration failed',
              },
            });
          }
          this.triggerShakeAnimation();
        },
      });
  }

  triggerShakeAnimation() {
    this.shakeState.set('shake');
    setTimeout(() => {
      this.shakeState.set('idle');
    }, 500);
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
