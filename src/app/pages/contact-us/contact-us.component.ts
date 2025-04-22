import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ArrowButtonComponent } from '../../shared/components/arrow-button/arrow-button.component';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { ServiceCardComponent } from '../about-us/components/service-card/service-card.component';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [
    TranslateModule,
    BannerComponent,
    ServiceCardComponent,
    ArrowButtonComponent,
  ],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent {}
