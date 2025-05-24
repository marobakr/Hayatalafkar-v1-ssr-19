import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { SafeHtmlComponent } from '../../../core/safe-html/safe-html.component';
import { ArrowButtonComponent } from '../arrow-button/arrow-button.component';

@Component({
  selector: 'app-big-card-offer',
  standalone: true,
  imports: [
    NgClass,
    TranslateModule,
    ArrowButtonComponent,
    SafeHtmlComponent,
    CustomTranslatePipe,
  ],
  templateUrl: './big-card-offer.component.html',
  styleUrl: './big-card-offer.component.css',
})
export class BigCardOfferComponent {
  @Input({ required: true }) alt: string = '';
  @Input({ required: true }) imgPath: string = '';
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) subtitle: string = '';
  @Input({ required: true }) description: string = '';

  @Input({ required: true }) mainColor: boolean = false;
}
