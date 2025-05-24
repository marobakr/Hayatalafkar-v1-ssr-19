import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ICategory } from '@core/interfaces/common.model';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { CommonService } from '@core/services/common/common.service';
import { LanguageService } from '@core/services/lang/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { AboutUsService } from 'src/app/pages/about-us/res/about-us.service';
import { IContactUs } from 'src/app/pages/contact-us/res/contact-us.interface';
import { ContactUsService } from 'src/app/pages/contact-us/res/contact-us.service';
import { SafeHtmlComponent } from '../../core/safe-html/safe-html.component';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    TranslateModule,
    CustomTranslatePipe,
    RouterLink,
    AsyncPipe,
    SafeHtmlComponent,
    CustomTranslatePipe,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit {
  _commonService = inject(CommonService);

  _languageService = inject(LanguageService);

  _router = inject(Router);

  _aboutService = inject(AboutUsService);

  _contactUsService = inject(ContactUsService);

  contactUs = signal<IContactUs>({} as IContactUs);

  footerTitle: string = '';

  categories = signal<ICategory[]>([]);

  currentLang$ = this._languageService.getLanguage();

  ngOnInit(): void {
    this.getCategories();
    this.getFooterTitle();
    this.getContactUs();
  }

  getContactUs(): void {
    this._contactUsService.getContactUs().subscribe({
      next: (response: any) => {
        if (response) {
          this.contactUs.set(response.contact);
        }
      },
    });
  }

  getCategories() {
    this._commonService.getAllCategories().subscribe((res: any) => {
      console.log(res);
      this.categories.set(res.categories);
    });
  }

  getFooterTitle() {
    this._aboutService.getAboutData().subscribe((res: any) => {
      console.log(res);
      this.footerTitle = res.aboutdata;
    });
  }
}
