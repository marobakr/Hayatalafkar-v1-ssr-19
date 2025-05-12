import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IQuotes } from '@core/interfaces/common.model';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { API_CONFIG } from '@core/services/conf/api.config';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ArrowButtonComponent } from '../../shared/components/arrow-button/arrow-button.component';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { ServiceCardComponent } from '../about-us/components/service-card/service-card.component';
import {
  IContactUs,
  IContactUsForm,
  IFeatures,
} from './res/contact-us.interface';
import { ContactUsService } from './res/contact-us.service';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [
    TranslateModule,
    BannerComponent,
    ServiceCardComponent,
    ArrowButtonComponent,
    CustomTranslatePipe,
    ReactiveFormsModule,
    CommonModule,
    NgClass,
  ],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent implements OnInit {
  private readonly contactUsService = inject(ContactUsService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

  // Using signals for reactive state management
  features = signal<IFeatures>({} as IFeatures);
  contactUs = signal<IContactUs>({} as IContactUs);
  breaks = signal<IQuotes[]>([]);
  isSubmitting = signal<boolean>(false);

  // Form group
  contactForm!: FormGroup;

  // Constants
  readonly API_CONFIG = API_CONFIG.BASE_URL_IMAGE;

  ngOnInit(): void {
    this.initForm();
    this.loadPageData();
  }

  /**
   * Initialize contact form with validators
   */
  private initForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^[0-9+\s-]{8,15}$/)],
      ],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  /**
   * Loads all page data in parallel
   */
  private loadPageData(): void {
    // Load features and contact info
    this.getFeatures();
    this.getContactUs();
  }

  /**
   * Fetches features and quotes data
   */
  private getFeatures(): void {
    this.contactUsService.getFeatures().subscribe({
      next: (response: any) => {
        if (response) {
          this.features.set(response.features);
          this.breaks.set(response.breaks || []);
        }
      },
    });
  }

  /**
   * Fetches contact information
   */
  private getContactUs(): void {
    this.contactUsService.getContactUs().subscribe({
      next: (response: any) => {
        if (response) {
          this.contactUs.set(response);
        }
      },
    });
  }

  /**
   * Submit contact form
   */
  onSubmit(): void {
    if (this.contactForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.contactForm.controls).forEach((key) => {
        const control = this.contactForm.get(key);
        control?.markAsTouched();
      });

      this.toastr.warning(
        'Please complete all required fields correctly',
        'Validation Error'
      );
      return;
    }

    const formData: IContactUsForm = this.contactForm.value;
    this.isSubmitting.set(true);

    // Call the contact form submission API
    this.contactUsService
      .getContactUsForm(formData)
      .pipe(
        catchError((error) => {
          console.error('Error submitting form:', error);
          this.toastr.error('Failed to submit form', 'Error');
          return of(null);
        }),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.toastr.success(
              'Your message has been sent successfully',
              'Thank You'
            );
            this.contactForm.reset();
          }
        },
      });
  }

  /**
   * Get form control validity class
   */
  getControlClass(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (!control) return '';

    return control.touched
      ? control.invalid
        ? 'border-red-500'
        : 'border-green-500'
      : '';
  }
}
