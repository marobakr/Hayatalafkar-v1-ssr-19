import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'filterHtml',
  standalone: true,
})
export class FilterHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  // Allowed tags and attributes
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
    'strong',
    'img',
    'table',
    'tr',
    'td',
    'th',
  ];

  private allowedAttributes: string[] = [
    'src',
    'alt',
    'width',
    'href',
    'title',
  ];

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(value, 'text/html');

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
  }

  private cleanNode(node: Element): void {
    // Process all child nodes
    Array.from(node.children).forEach((child) => {
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
        return;
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
    });
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
