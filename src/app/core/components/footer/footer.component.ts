import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FooterBackgroundComponent } from './footer-background.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ReactiveFormsModule, FooterBackgroundComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  emailControl = new FormControl('');

  onSubscribe(): void {
    if (this.emailControl.valid) {
      // Here you would typically call a service to handle the newsletter subscription
      console.log('Subscribe email:', this.emailControl.value);
      this.emailControl.reset();
    }
  }
}
