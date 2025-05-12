import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICategory } from '@core/interfaces/common.model';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { CategoryService } from '@core/services/category.service';
import { TranslateModule } from '@ngx-translate/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LanguageService } from '../../core/services/lang/language.service';
@Component({
  selector: 'app-mega-menu',
  standalone: true,
  imports: [TranslateModule, NgClass, RouterLink, CustomTranslatePipe],
  templateUrl: './mega-menu.component.html',
  styleUrl: './mega-menu.component.css',
})
export class MegaMenuComponent implements AfterViewInit, OnDestroy {
  @ViewChild('menuContent') menuContent!: ElementRef;
  @Input() isMobile: boolean = false;

  contentHeight = 0;
  private resizeSub?: Subscription;

  // Inject the language service
  protected languageService = inject(LanguageService);

  ngAfterViewInit() {
    // Use setTimeout to ensure view is rendered
    setTimeout(() => {
      this.updateContentHeight();

      this.resizeSub = fromEvent(window, 'resize')
        .pipe(debounceTime(150))
        .subscribe(() => {
          this.updateContentHeight();
        });
    });
  }

  ngOnDestroy() {
    this.resizeSub?.unsubscribe();
  }

  private updateContentHeight() {
    if (this.menuContent?.nativeElement) {
      this.contentHeight = this.menuContent.nativeElement.scrollHeight;
    }
  }

  categoryService = inject(CategoryService);

  categories: ICategory[] = [];

  ngOnInit() {
    this.getAllCategories();
  }

  getAllCategories() {
    this.categoryService.getAllCategories().subscribe((res: any) => {
      console.log(res.categories);
      this.categories = res.categories;
    });
  }
}
