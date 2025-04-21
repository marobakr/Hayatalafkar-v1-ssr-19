import { NgOptimizedImage } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppSearchComponent } from '../../../shared/components/app-search/app-search.component';
import {
  animate,
  style,
  transition,
  trigger,
  AnimationEvent
} from '@angular/animations';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgOptimizedImage,
    AppSearchComponent
  ],
  animations: [
    trigger('slideMenu', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        )
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('300ms ease-in',
          style({ transform: 'translateX(-100%)', opacity: 0 })
        )
      ])
    ]),
    trigger('overlay', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out',
          style({ opacity: 1 })
        )
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('150ms ease-in',
          style({ opacity: 0 })
        )
      ])
    ])
  ]
})
export class NavbarComponent {
  isMenuOpen = false;
  isSearchOpen = false;
  isAnimating = false;

  @HostListener('window:keydown.escape')
  handleEscKey(): void {
    if (this.isMenuOpen) {
      this.closeMenu();
    }
    if (this.isSearchOpen) {
      this.toggleSearch();
    }
  }

  toggleMenu(): void {
    if (this.isAnimating) return;

    if (!this.isMenuOpen) {
      this.openMenu();
    } else {
      this.closeMenu();
    }
  }

  openMenu(): void {
    this.isMenuOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    document.body.style.overflow = '';
  }

  onAnimationStart(event: AnimationEvent): void {
    this.isAnimating = true;
  }

  onAnimationDone(event: AnimationEvent): void {
    this.isAnimating = false;
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  handleSearch(query: string): void {
    console.log('Searching for:', query);
    this.isSearchOpen = false;
    // Implement search navigation or search logic
  }
}
