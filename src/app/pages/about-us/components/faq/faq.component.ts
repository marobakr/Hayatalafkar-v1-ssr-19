import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { ArrowButtonComponent } from '@shared/components/arrow-button/arrow-button.component';
import {
  AccordionComponent,
  AccordionContentComponent,
  AccordionPanelComponent,
  AccordionTitleComponent,
} from 'flowbite-angular/accordion';
import { SafeHtmlComponent } from '../../../../core/safe-html/safe-html.component';
import { IFaq } from '../../res/about-us.interface';
@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ArrowButtonComponent,
    AccordionComponent,
    AccordionPanelComponent,
    AccordionContentComponent,
    AccordionTitleComponent,
    SafeHtmlComponent,
    CustomTranslatePipe,
    RouterLink,
  ],
})
export class FAQComponent {
  @Input() faqs: IFaq[] = [];
}
