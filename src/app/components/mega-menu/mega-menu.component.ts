import { isPlatformBrowser, NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICategory } from '@core/interfaces/common.model';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LanguageService } from '../../core/services/lang/language.service';
import { CommonService } from './../../core/services/common/common.service';
@Component({
  selector: 'app-mega-menu',
  standalone: true,
  imports: [TranslateModule, NgClass, RouterLink, CustomTranslatePipe],
  templateUrl: './mega-menu.component.html',
  styleUrl: './mega-menu.component.css',
})
export class MegaMenuComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('menuContent') menuContent!: ElementRef;
  @Input() isMobile: boolean = false;
  @Output() closeMenu = new EventEmitter<void>();

  contentHeight = 0;
  private resizeSub?: Subscription;
  isLoading = true;
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // Inject the language service
  protected languageService = inject(LanguageService);

  ngOnInit() {
    this.getAllCategories();

    // Only add document click handler in browser environment
    if (this.isBrowser) {
      // Add document click handler with a small delay
      setTimeout(() => {
        document.addEventListener('click', this.handleDocumentClick);
      }, 100);
    }
  }

  // Store the handler as a property so we can remove it later
  private handleDocumentClick = (event: Event) => {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu.emit();
    }
  };

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    // Setup resize handler for adjusting menu height
    this.resizeSub = fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe(() => {
        this.adjustMenuHeight();
      });

    // Initial height adjustment
    setTimeout(() => {
      this.adjustMenuHeight();
    }, 0);
  }

  ngOnDestroy() {
    // Cleanup event listeners
    if (this.isBrowser) {
      document.removeEventListener('click', this.handleDocumentClick);
    }

    if (this.resizeSub) {
      this.resizeSub.unsubscribe();
    }
  }

  private adjustMenuHeight() {
    if (this.menuContent?.nativeElement) {
      this.contentHeight = this.menuContent.nativeElement.scrollHeight;
    }
  }

  categoryService = inject(CommonService);

  categories: ICategory[] = [];

  getAllCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (res: any) => {
        this.categories = res.categories;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.isLoading = false;
      },
    });
  }
}
