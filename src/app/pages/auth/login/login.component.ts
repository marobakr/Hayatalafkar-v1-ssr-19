import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
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
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  _fb = inject(FormBuilder);

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
