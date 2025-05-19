import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AlertComponent } from './shared/alert/alert.component';
import { NotificationComponent } from './shared/components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    TranslateModule,
    NavbarComponent,
    FooterComponent,
    AlertComponent,
    NotificationComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private translationService = inject(TranslateService);
  title = 'hayatalafkar-v1-ssr';

  constructor() {
    this.translationService.setDefaultLang('ar');
    this.translationService.use('ar');
  }

  switchLanguage(lang: string) {
    this.translationService.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
