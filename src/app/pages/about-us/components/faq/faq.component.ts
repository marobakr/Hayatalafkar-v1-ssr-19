import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ArrowButtonComponent } from '@shared/components/arrow-button/arrow-button.component';
import {
  AccordionComponent,
  AccordionContentComponent,
  AccordionPanelComponent,
  AccordionTitleComponent,
} from 'flowbite-angular/accordion';

interface FAQItem {
  id: string;
  title: string;
  content: string;
  isOpen: boolean;
}

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
  ],
})
export class FAQComponent {
  faqItems = signal<FAQItem[]>([
    {
      id: 'faq-1',
      title: 'FAQ.Accordions.Accordion-1',
      content: 'FAQ.Accordions.Accordion-1',
      isOpen: false,
    },
    {
      id: 'faq-2',
      title: 'FAQ.Accordions.Accordion-2',
      content: 'FAQ.Accordions.Accordion-2',
      isOpen: false,
    },
    {
      id: 'faq-3',
      title: 'FAQ.Accordions.Accordion-3',
      content: 'FAQ.Accordions.Accordion-3',
      isOpen: false,
    },
  ]);
}
