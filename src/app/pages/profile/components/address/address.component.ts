import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [TranslateModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css'],
})
export class AddressComponent {
  _fb = inject(FormBuilder);

  addressForm!: FormGroup;
  ngOnInit(): void {
    this.intiForm();
  }

  intiForm() {
    this.addressForm = this._fb.group({
      /* all form control here  */
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      country: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', Validators.required],
      postalCode: ['', Validators.required],
    });
  }

  submition() {
    console.log(this.addressForm.value);
  }
}
