import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ArticlesHeaderComponent } from '../../articles/components/articles-header/articles-header.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ArticlesHeaderComponent,
    ReactiveFormsModule,
    TranslateModule,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
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
