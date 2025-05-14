import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class HtmlSanitizerService {
  private sanitizer = inject(DomSanitizer);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // Default allowed tags and attributes
  private allowedTags: string[] = [
    'p',
    'div',
    'span',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'a',
    'em',
    'img',
  ];

  private allowedAttributes: string[] = [
    'src',
    'alt',
    'width',
    'href',
    'title',
  ];

  /**
   * Sanitizes HTML content by removing unwanted tags, attributes, and styles
   * @param html The HTML content to sanitize
   * @returns SafeHtml that can be used with [innerHTML]
   */
  sanitize(html: string): SafeHtml {
    if (!html) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    // Use regex-based sanitization for SSR
    if (!this.isBrowser) {
      return this.sanitizer.bypassSecurityTrustHtml(this.simpleCleanHtml(html));
    }

    try {
      // Parse HTML (browser-only)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Clean the HTML
      this.cleanNode(doc.body);

      // Remove empty tags
      this.removeEmptyTags(doc.body);

      // Remove all classes
      this.removeAllClasses(doc.body);

      // Get cleaned HTML content
      const cleanedHtml = doc.body.innerHTML;

      // Return as SafeHtml for binding
      return this.sanitizer.bypassSecurityTrustHtml(cleanedHtml);
    } catch (error) {
      console.error('Error sanitizing HTML:', error);
      // Fallback to simple regex cleaning
      return this.sanitizer.bypassSecurityTrustHtml(this.simpleCleanHtml(html));
    }
  }

  /**
   * Server-side simple HTML cleaning using regex
   */
  private simpleCleanHtml(html: string): string {
    // Remove disallowed tags
    const allowedTagsPattern = this.allowedTags.join('|');
    const tagRegex = new RegExp(
      `<(?!\\/?(${allowedTagsPattern})\\b)[^>]+>`,
      'gi'
    );
    html = html.replace(tagRegex, '');

    // Remove classes
    html = html.replace(/\sclass="[^"]*"/gi, '');

    // Remove style attributes
    html = html.replace(/\sstyle="[^"]*"/gi, '');

    // Remove other disallowed attributes (keep only allowed ones)
    const allowedAttributesStr = this.allowedAttributes.join('|');
    const attrRegex = new RegExp(
      `\\s(?!(${allowedAttributesStr})\\b)[^\\s>]+(?:=(?:"[^"]*"|'[^']*'))?`,
      'gi'
    );
    html = html.replace(attrRegex, '');

    return html;
  }

  /**
   * Strips all HTML tags and returns only the text content
   * @param html The HTML content to strip
   * @returns Plain text with no HTML
   */
  stripAllHtml(html: string): string {
    if (!html) return '';

    // Server-side implementation
    if (!this.isBrowser) {
      // Use regex to remove all HTML tags
      return html.replace(/<[^>]*>/g, '');
    }

    // Browser implementation
    try {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || '';
    } catch (error) {
      console.error('Error stripping HTML:', error);
      // Fallback to regex
      return html.replace(/<[^>]*>/g, '');
    }
  }

  private cleanNode(node: Element): void {
    // Process all child nodes
    const childNodes = Array.from(node.children);

    for (const child of childNodes) {
      // Check if this tag is allowed, if not, replace with its content
      if (!this.allowedTags.includes(child.tagName.toLowerCase())) {
        // Create a document fragment to hold the child's content
        const fragment = document.createDocumentFragment();

        // Move all child nodes to the fragment
        while (child.firstChild) {
          fragment.appendChild(child.firstChild);
        }

        // Replace the child with its content
        if (child.parentNode) {
          child.parentNode.replaceChild(fragment, child);
        }

        // Skip further processing for this node since it's been replaced
        continue;
      }

      // Keep only allowed attributes and remove all others
      Array.from(child.attributes).forEach((attr) => {
        if (!this.allowedAttributes.includes(attr.name)) {
          child.removeAttribute(attr.name);
        }
      });

      // Always remove style attribute
      child.removeAttribute('style');

      // Process children recursively
      this.cleanNode(child);
    }
  }

  private removeEmptyTags(node: Element): void {
    const childNodes = Array.from(node.children);

    for (let i = childNodes.length - 1; i >= 0; i--) {
      const child = childNodes[i];

      // Recursively clean child nodes first
      this.removeEmptyTags(child);

      // Check if the node is empty (no text content and no children)
      const isEmpty = !child.textContent?.trim() && child.children.length === 0;

      // Remove empty nodes, but preserve img tags even if they're "empty"
      if (isEmpty && child.tagName.toLowerCase() !== 'img') {
        child.remove();
      }
    }
  }

  private removeAllClasses(node: Element): void {
    // Remove class attribute from current node
    node.removeAttribute('class');

    // Process all child nodes recursively
    Array.from(node.children).forEach((child) => {
      this.removeAllClasses(child);
    });
  }
}
