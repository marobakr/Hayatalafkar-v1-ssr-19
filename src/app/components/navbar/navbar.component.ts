import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/service/lang/language.service';
import { MegaMenuComponent } from '../mega-menu/mega-menu.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, MegaMenuComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnDestroy {
  showMenu: boolean = false;
  showSearch: boolean = false;
  showMobileSearch: boolean = false;
  showDesktopSearch: boolean = false;
  showProductsMenu = false;
  showMegaMenu = false;
  isMenuOpen = false;

  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _languageService = inject(LanguageService);
  private platformId = inject(PLATFORM_ID);

  currentLang$ = this._languageService.getLanguage();

  // Add this property to track the last clicked element
  private lastClickedElement: HTMLElement | null = null;

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {}

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
    this.showDesktopSearch = false;
  }

  toggleDesktopSearch() {
    this.showDesktopSearch = !this.showDesktopSearch;
    this.showMobileSearch = false;
  }

  toggleSearch(event: Event) {
    event.stopPropagation();
    this.showSearch = !this.showSearch;
  }

  toggleProductsMenu(event: Event) {
    event.stopPropagation();
    this.showProductsMenu = !this.showProductsMenu;
  }

  closeProductsMenu() {
    this.showProductsMenu = false;
  }

  @HostListener('document:click')
  onClickOutside() {
    this.showProductsMenu = false;

    if (isPlatformBrowser(this.platformId)) {
      const searchContainer =
        this.elementRef.nativeElement.querySelector('.search-container');
      if (!searchContainer?.matches(':hover')) {
        this.showSearch = false;
      }
    }
  }

  toggleMegaMenu(event: Event): void {
    event.stopPropagation();
    const clickedElement = event.target as HTMLElement;
    const listItem = clickedElement.closest('li');

    // If clicking the same li element, close the menu
    if (this.showMegaMenu && listItem && this.lastClickedElement === listItem) {
      this.showMegaMenu = false;
      this.lastClickedElement = null;
      return;
    }

    // Store the clicked element and open the menu
    this.lastClickedElement = listItem;
    this.showMegaMenu = true;
  }

  toggleMobileMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  ngOnDestroy(): void {
    this.renderer.destroy();
  }
}
