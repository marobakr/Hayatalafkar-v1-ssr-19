import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { AboutUs, Counter } from 'src/app/pages/home/res/home.interfaces';
import { SloganComponent } from '../slogan/slogan.component';
@Component({
  selector: 'app-about-shared',
  standalone: true,
  imports: [
    NgClass,
    SloganComponent,
    TranslateModule,
    CustomTranslatePipe,
    RouterLink,
    ImageUrlDirective,
    AsyncPipe,
  ],
  templateUrl: './about-shared.component.html',
  styleUrl: './about-shared.component.css',
})
export class AboutSharedComponent {
  /* Static Inputs Properties */
  @Input({ required: true }) showBgImage: boolean = false;
  @Input({ required: true }) sloganText: string = '';
  @Input({ required: true }) showSloganText: boolean = true;

  /* Dynamic Inputs Properties */
  @Input({ required: true }) aboutUs: AboutUs = {} as AboutUs;
  @Input({ required: true }) counters: Counter[] = [] as Counter[];

  @Input() mainImage!: string;

  currentImage: string | null = null;
  currentLang$ = inject(LanguageService).getLanguage();
}
