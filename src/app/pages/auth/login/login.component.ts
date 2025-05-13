import { AsyncPipe, NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ArticlesHeaderComponent } from '../../articles/components/articles-header/articles-header.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ArticlesHeaderComponent,
    TranslateModule,
    ReactiveFormsModule,
    ButtonComponent,
    AsyncPipe,
    RouterLink,
    NgClass,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _toastr = inject(ToastrService);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);

  currentLang$ = this._languageService.getLanguage();
  loginForm!: FormGroup;
  isLoading = signal(false);

  // Form state signals
  emailTouched = signal(false);
  passwordTouched = signal(false);

  // Computed values for validation state
  emailInvalid = computed(() => this.email?.invalid && this.emailTouched());

  passwordInvalid = computed(
    () => this.password?.invalid && this.passwordTouched()
  );

  formInvalid = computed(() => this.loginForm?.invalid || this.isLoading());

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.loginForm = this._fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submition() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.emailTouched.set(true);
      this.passwordTouched.set(true);
      return;
    }

    this.isLoading.set(true);

    this._authService.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        let lang = '';
        this.currentLang$.subscribe((next) => (lang = next));
        if (response.access_token) {
          if (lang === 'ar') {
            this._toastr.success('تم تسجيل الدخول بنجاح');
          } else {
            this._toastr.success('Login successful');
          }
          this._router.navigate(['/', lang, 'home']);
        } else {
          if (lang === 'ar') {
            this._toastr.warning(response.ar_error);
          } else {
            this._toastr.warning(response.en_error);
          }
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMessage =
          error?.error?.message || 'Login failed. Please try again.';
        this._toastr.error(errorMessage);
      },
    });
  }

  onEmailBlur() {
    this.emailTouched.set(true);
  }

  onPasswordBlur() {
    this.passwordTouched.set(true);
  }

  // Helper methods for template
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
