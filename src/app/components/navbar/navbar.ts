import { AsyncPipe } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/service/lang/language.service';

@Component({
  selector: 'app-navbar',
  imports: [TranslateModule, RouterLink, AsyncPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  showMenu: boolean = false;
  showSearch: boolean = false;
  showMobileSearch: boolean = false;
  showDesktopSearch: boolean = false;

  _router = inject(Router);

  _activatedRoute = inject(ActivatedRoute);

  _languageService = inject(LanguageService);

  currentLang$ = this._languageService.getLanguage();

  changeLang(lang: string): void {
    const currentUrl = this._router.url;
    this._languageService.changeLanguage(lang, currentUrl);
    this.showMenu = false;
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  toggleMobileSearch() {
    this.showMobileSearch = !this.showMobileSearch;
    // Close desktop search if open
    this.showDesktopSearch = false;
  }

  toggleDesktopSearch() {
    this.showDesktopSearch = !this.showDesktopSearch;
    // Close mobile search if open
    this.showMobileSearch = false;
  }

  toggleSearch(event: Event) {
    event.stopPropagation(); // Prevent event bubbling
    this.showSearch = !this.showSearch;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    // Close search if click is outside search area
    if (!(event.target as HTMLElement).closest('.search-container')) {
      this.showSearch = false;
    }
  }
}
