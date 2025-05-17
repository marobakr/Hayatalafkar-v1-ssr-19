import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '../../../../shared/alert/alert.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, ButtonComponent],
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css'],
})
export class PasswordComponent implements OnInit {
  passwordForm!: FormGroup;

  fb = inject(FormBuilder);

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.passwordForm = this.fb.group(
      {
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

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      // this.alertService.show({
      //   title: 'Update Password',
      //   message: 'Are you sure you want to update your password?',
      //   confirmText: 'Update',
      //   cancelText: 'Cancel',
      //   onConfirm: () => {
      //     // Handle password update
      //     console.log('Password updated');
      //   },
      //   onCancel: () => {
      //     console.log('Update cancelled');
      //   },
      // });
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
