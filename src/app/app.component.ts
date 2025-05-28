import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { filter, map, Subscription } from 'rxjs';
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
    NgxSpinnerModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private translationService = inject(TranslateService);
  private router = inject(Router);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private routerSubscription!: Subscription;

  constructor() {
    this.translationService.setDefaultLang('ar');
    this.translationService.use('ar');
  }

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let child = this.router.routerState.root;
          while (child.firstChild) {
            child = child.firstChild;
          }
          return child.snapshot.data;
        })
      )
      .subscribe((data) => {
        if (data['title']) {
          this.translationService
            .get(data['title'])
            .subscribe((title: string) => {
              this.titleService.setTitle(title);
            });
        }
        if (data['description']) {
          this.translationService
            .get(data['description'])
            .subscribe((desc: string) => {
              this.metaService.updateTag({
                name: 'description',
                content: desc,
              });
            });
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  switchLanguage(lang: string) {
    this.translationService.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
