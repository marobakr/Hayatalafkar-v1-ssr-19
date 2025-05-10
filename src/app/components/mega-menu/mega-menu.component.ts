import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-mega-menu',
  standalone: true,
  imports: [TranslateModule, NgClass],
  templateUrl: './mega-menu.component.html',
  styleUrl: './mega-menu.component.css',
})
export class MegaMenuComponent implements AfterViewInit, OnDestroy {
  @ViewChild('menuContent') menuContent!: ElementRef;
  @Input() isMobile: boolean = false;

  contentHeight = 0;
  private resizeSub?: Subscription;

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
}
