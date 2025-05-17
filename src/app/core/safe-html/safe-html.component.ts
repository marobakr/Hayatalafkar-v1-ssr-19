import { Component, Input, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FilterHtmlPipe } from '@core/pipes/filter-html.pipe';

@Component({
  selector: 'app-safe-html',
  standalone: true,
  imports: [FilterHtmlPipe],
  template: `
    <div
      [title]="htmlContent | filterHtml"
      class="safe-html-content"
      [innerHTML]="htmlContent | filterHtml"
    ></div>
  `,
  styles: `
    :host {
      display: contents;
    }
    .safe-html-content {
      display: contents;
    }
  `,
  host: {
    ngSkipHydration: 'true',
  },
})
export class SafeHtmlComponent {
  @Input() set content(value: string) {
    // Store the original content
    this._content = value;

    // Process the content through sanitizer first
    this.htmlContent =
      this.sanitizer.sanitize(SecurityContext.HTML, value) || '';
  }

  get content(): string {
    return this._content;
  }

  private _content = '';
  htmlContent = '';

  private sanitizer = inject(DomSanitizer);
}
