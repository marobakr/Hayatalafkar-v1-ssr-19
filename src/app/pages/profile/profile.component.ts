import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LanguageService } from '../../core/services/lang/language.service';
import { TalentImageCardComponent } from '../../shared/components/talent-image-card/talent-image-card.component';
import { ArticlesHeaderComponent } from '../articles/components/articles-header/articles-header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    RouterOutlet,
    ArticlesHeaderComponent,
    TranslateModule,
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
    TalentImageCardComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  _languageService = inject(LanguageService);

  isProfileDetailsRoute$!: Observable<boolean>;

  currentLang$ = this._languageService.getLanguage();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isProfileDetailsRoute$ = this.router.events.pipe(
      map(() => {
        const url = this.router.url;
        return ['/profile/address', '/profile/orders'].some((path) =>
          url.includes(path)
        );
      })
    );
  }
}
