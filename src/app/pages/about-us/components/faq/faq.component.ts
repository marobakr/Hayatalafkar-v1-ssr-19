import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ArrowButtonComponent } from '../../../../shared/components/arrow-button/arrow-button.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [TranslateModule, ArrowButtonComponent],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
})
export class FAQComponent {}
