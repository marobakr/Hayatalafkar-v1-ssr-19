import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/service/lang/language.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, ButtonComponent],
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css'],
})
export class ProfileDetailsComponent {
  _fb = inject(FormBuilder);
  _languageService = inject(LanguageService);

  currentLang$ = this._languageService.getLanguage();

  loginForm!: FormGroup;
  ngOnInit(): void {
    this.intiForm();
  }

  intiForm() {
    this.loginForm = this._fb.group({
      email: [''],
      password: [''],
    });
  }

  submition() {
    console.log(this.loginForm.value);
  }
}
