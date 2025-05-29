import { AsyncPipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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

interface CategoryResponse {
  categories: ICategory[];
}

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
  private commonService = inject(CommonService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private aboutService = inject(AboutUsService);
  private contactUsService = inject(ContactUsService);

  contactUs = signal<IContactUs>({} as IContactUs);
  footerTitle: string = '';

  // Access the cached categories from CommonService
  private categoriesData = this.commonService.categories;

  // Create a computed signal for the categories
  categories = computed(() => {
    const data = this.categoriesData() as CategoryResponse | null;
    return data?.categories || [];
  });

  currentLang$ = this.languageService.getLanguage();

  constructor() {
    // Set up effect to load categories if not already cached
    effect(() => {
      if (!this.categoriesData()) {
        this.loadCategories();
      }
    });
  }

  ngOnInit(): void {
    this.getContactUs();
    this.getFooterTitle();
  }

  getContactUs(): void {
    this.contactUsService.getContactUs().subscribe({
      next: (response: any) => {
        if (response) {
          this.contactUs.set(response.contact);
        }
      },
    });
  }

  /**
   * Load categories if they're not already in the cache
   */
  private loadCategories(): void {
    this.commonService.getAllCategories().subscribe();
  }

  getFooterTitle() {
    this.aboutService.getAboutData().subscribe((res: any) => {
      console.log(res);
      this.footerTitle = res.aboutdata;
    });
  }
}
