import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { IAddress, ILocation } from '@core/interfaces/user.interface';
import { NotificationService } from '@core/services/notification/notification.service';
import { UserService } from '@core/services/user/user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';

@Component({
  selector: 'app-checkout-address',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    ButtonComponent,
    LoadingComponent,
  ],
  templateUrl: './checkout-address.component.html',
  styleUrls: ['./checkout-address.component.css'],
})
export class CheckoutAddressComponent implements OnInit {
  @Output() addressSelected = new EventEmitter<IAddress | null>();
  @Output() newAddressAdded = new EventEmitter<IAddress>();
  @Output() proceedToNextStep = new EventEmitter<void>();

  private _fb = inject(FormBuilder);
  private _userService = inject(UserService);
  private _destroyRef = inject(DestroyRef);
  private _translateService = inject(TranslateService);
  private _notificationService = inject(NotificationService);
  private _router = inject(Router);

  addressForm!: FormGroup;
  locations = signal<ILocation[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isFormSubmitted = signal(false);
  currentLang = signal(this._translateService.currentLang || 'en');

  // Track if the user has existing addresses
  addresses = signal<IAddress[]>([]);
  hasAddresses = signal(false);
  selectedAddressId = signal<number | null>(null);

  // Show add new address form only when user has no addresses
  showAddAddressForm = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.loadUserData();
  }

  /**
   * Load user data: addresses and available locations
   */
  loadUserData(): void {
    // First load locations
    this.getLocations();

    // Then get user addresses
    this.getUserAddresses();
  }

  getUserAddresses(): void {
    this.loading.set(true);
    this._userService
      .getUserInfo()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response && response.row && response.row.addresses) {
            this.addresses.set(response.row.addresses);
            const hasUserAddresses = response.row.addresses.length > 0;
            this.hasAddresses.set(hasUserAddresses);

            // Only show the form when user has no addresses
            this.showAddAddressForm.set(!hasUserAddresses);

            if (hasUserAddresses) {
              // If addresses exist, select the first one by default
              this.selectAddress(response.row.addresses[0]);
            } else {
              // No addresses, populate form with user info
              this.populateForm(response.row);
            }
          }
        },
        error: (error) => {
          this.loading.set(false);
          const errorMsg = error?.message || 'checkout.address.user_info_error';
          this._notificationService.error(
            errorMsg,
            'checkout.address.error_title'
          );
        },
      });
  }

  initForm(): void {
    this.addressForm = this._fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      email: ['', [Validators.required, Validators.email]],
      location_id: ['', [Validators.required]],
      user_id: [''],
    });
  }

  getLocations(): void {
    this.loading.set(true);
    this._userService
      .getLocations()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          if (response && response.locations) {
            this.locations.set(response.locations);
          } else {
            // No locations available - show notification
            this._notificationService.warning(
              'checkout.address.no_locations',
              'checkout.address.warning_title'
            );
          }
        },
        error: (error) => {
          const errorMsg = error?.message || 'checkout.address.locations_error';
          this._notificationService.error(
            errorMsg,
            'checkout.address.error_title'
          );
        },
        complete: () => {
          // Don't set loading to false yet, as we still need to load addresses
        },
      });
  }

  populateForm(userInformation: any): void {
    if (!userInformation) return;

    const nameArray = userInformation.name
      ? userInformation.name.split(' ')
      : ['', ''];
    const first_name = nameArray[0] || '';
    const last_name = nameArray.length > 1 ? nameArray.slice(1).join(' ') : '';

    this.addressForm.patchValue({
      first_name,
      last_name,
      address: userInformation.address || '',
      city: userInformation.city || '',
      phone: userInformation.phone || '',
      location_id: userInformation.location_id || '',
      email: userInformation.email || '',
      user_id: userInformation.id || '',
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.addressForm.get(field);
    return (
      !!control &&
      control.invalid &&
      (control.touched || this.isFormSubmitted())
    );
  }

  getErrorMessage(field: string): string {
    const control = this.addressForm.get(field);
    if (!control || control.valid) return '';

    if (control.hasError('required')) {
      return this._translateService.instant(
        `checkout.form.validation.${field}.required`
      );
    }

    if (field === 'email' && control.hasError('email')) {
      return this._translateService.instant(
        'checkout.form.validation.email.invalid'
      );
    }

    if (control.hasError('pattern')) {
      if (field === 'phone') {
        return this._translateService.instant(
          'checkout.form.validation.phone.pattern'
        );
      }
    }

    return '';
  }

  submitNewAddress(): void {
    this.isFormSubmitted.set(true);

    // Check if location is selected
    const locationId = this.addressForm.get('location_id')?.value;
    if (!locationId) {
      this._notificationService.warning(
        'checkout.address.select_location',
        'checkout.address.warning_title'
      );
      return;
    }

    if (this.addressForm.valid) {
      this.loading.set(true);
      const addressData = this.addressForm.value;
      this._userService
        .addNewAddress(addressData)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (response) => {
            this.loading.set(false);
            this._notificationService.success(
              'checkout.address.address_added_success',
              'checkout.address.success_title'
            );

            // Add the new address to the addresses list
            const newAddress = response.address;
            this.addresses.update((addresses) => [...addresses, newAddress]);
            this.hasAddresses.set(true);
            this.showAddAddressForm.set(false);

            // Select the newly added address
            this.selectAddress(newAddress);

            // Emit the new address to parent component
            this.newAddressAdded.emit(newAddress);
          },
          error: (error) => {
            this.loading.set(false);
            const errorMsg = error?.message || 'checkout.address.address_error';
            this._notificationService.error(
              errorMsg,
              'checkout.address.error_title'
            );
          },
        });
    } else {
      this.addressForm.markAllAsTouched();
      this._notificationService.warning(
        'checkout.address.form_invalid',
        'checkout.address.validation_title'
      );
    }
  }

  resetForm(): void {
    this.addressForm.reset();
    this.isFormSubmitted.set(false);
    this._notificationService.info(
      'checkout.address.form_reset',
      'checkout.address.info_title'
    );
  }

  /**
   * Method to select an address and proceed to next step
   */
  selectAddress(address: IAddress): void {
    this.selectedAddressId.set(address.id);
    this.addressSelected.emit(address);
  }

  /**
   * Continue to the next step
   */
  continueToNextStep(): void {
    if (!this.selectedAddressId()) {
      this._notificationService.warning(
        'checkout.address.select_address_to_continue',
        'checkout.address.warning_title'
      );
      return;
    }

    this.proceedToNextStep.emit();

    // Navigate to the next step
    this._translateService
      .get('checkout.address.continuing_to_summary')
      .subscribe((msg) => {
        this._notificationService.info(msg, 'checkout.info');
      });
  }

  toggleAddressForm(): void {
    // Only if user has addresses, allow toggling the form
    if (this.hasAddresses()) {
      this.showAddAddressForm.update((value) => !value);

      // Reset selected address if showing form
      if (this.showAddAddressForm()) {
        this.selectedAddressId.set(null);
        this.addressSelected.emit(null);
      } else if (this.addresses().length > 0 && !this.selectedAddressId()) {
        // If hiding form and no address selected, select the first one
        this.selectAddress(this.addresses()[0]);
      }
    }
  }

  isAddressSelected(address: IAddress): boolean {
    return this.selectedAddressId() === address.id;
  }
}
