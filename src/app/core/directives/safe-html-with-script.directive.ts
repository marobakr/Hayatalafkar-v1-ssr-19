import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  PLATFORM_ID,
  inject,
} from '@angular/core';

@Directive({
  selector: '[safeHtmlWithScripts]',
  standalone: true,
})
export class SafeHtmlWithScriptsDirective implements OnChanges {
  @Input('safeHtmlWithScripts') htmlContent: string = '';

  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private el: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnChanges() {
    if (!this.htmlContent) {
      return;
    }

    // Skip processing during SSR if no content
    if (!this.isBrowser) {
      // For SSR, just set a placeholder or do minimal processing
      if (this.el.nativeElement) {
        this.el.nativeElement.innerHTML = '';
      }
      return;
    }

    try {
      // Clear the element
      this.el.nativeElement.innerHTML = '';

      // Extract and inject HTML content (without scripts)
      const htmlWithoutScripts = this.extractHtmlWithoutScripts(
        this.htmlContent
      );
      this.el.nativeElement.innerHTML = htmlWithoutScripts;

      // Only execute scripts in browser environment
      if (this.isBrowser) {
        this.executeScripts(this.htmlContent);
      }
    } catch (error) {
      console.error('Error processing HTML with scripts:', error);
    }
  }

  private extractHtmlWithoutScripts(content: string): string {
    return content.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    );
  }

  private executeScripts(content: string) {
    // Only run in browser environment
    if (!this.isBrowser) {
      return;
    }

    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
    let match;

    while ((match = scriptRegex.exec(content))) {
      const scriptContent = match[1];
      const scriptElement = this.document.createElement('script');
      scriptElement.textContent = scriptContent;
      this.document.body.appendChild(scriptElement);
    }
  }
}
