import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { SafeHtmlComponent } from '../../../core/safe-html/safe-html.component';

@Component({
  selector: 'app-example-safe-html',
  standalone: true,
  imports: [CommonModule, SafeHtmlComponent],
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-2xl font-bold mb-6">Safe HTML Component Examples</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Basic Example -->
        <div class="border rounded-lg p-4 shadow">
          <h2 class="text-xl font-semibold mb-4">Basic Example</h2>
          <div class="bg-gray-50 p-4 rounded mb-4">
            <app-safe-html [content]="basicExample()"></app-safe-html>
          </div>
          <div class="text-sm bg-gray-100 p-4 rounded overflow-auto">
            <pre>{{ basicExample() }}</pre>
          </div>
        </div>

        <!-- Rich Text Example -->
        <div class="border rounded-lg p-4 shadow">
          <h2 class="text-xl font-semibold mb-4">Rich Text Example</h2>
          <div class="bg-gray-50 p-4 rounded mb-4">
            <app-safe-html [content]="richTextExample()"></app-safe-html>
          </div>
          <div class="text-sm bg-gray-100 p-4 rounded overflow-auto">
            <pre>{{ richTextExample() }}</pre>
          </div>
        </div>

        <!-- Nested Elements Example -->
        <div class="border rounded-lg p-4 shadow">
          <h2 class="text-xl font-semibold mb-4">Nested Elements</h2>
          <div class="bg-gray-50 p-4 rounded mb-4">
            <app-safe-html [content]="nestedExample()"></app-safe-html>
          </div>
          <div class="text-sm bg-gray-100 p-4 rounded overflow-auto">
            <pre>{{ nestedExample() }}</pre>
          </div>
        </div>

        <!-- Mixed Content Example -->
        <div class="border rounded-lg p-4 shadow">
          <h2 class="text-xl font-semibold mb-4">Mixed Content</h2>
          <div class="bg-gray-50 p-4 rounded mb-4">
            <app-safe-html [content]="mixedExample()"></app-safe-html>
          </div>
          <div class="text-sm bg-gray-100 p-4 rounded overflow-auto">
            <pre>{{ mixedExample() }}</pre>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-amber-50 border border-amber-200 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Important Usage Notes</h2>

        <ul class="list-disc ml-6 space-y-2">
          <li>
            <strong>Always ensure</strong> the parent container of app-safe-html
            is a proper block element (div, p, section, etc.) not an inline
            element.
          </li>
          <li>
            <strong>Avoid nesting</strong> app-safe-html inside paragraph tags
            to prevent hydration issues:
            <pre
              class="bg-red-50 p-2 mt-1 text-sm rounded border border-red-200"
            >
&lt;p&gt;
  &lt;app-safe-html [content]="htmlContent"&gt;&lt;/app-safe-html&gt;  &lt;!-- BAD! --&gt;
&lt;/p&gt;</pre
            >
          </li>
          <li>
            <strong>Instead, use this pattern:</strong>
            <pre
              class="bg-green-50 p-2 mt-1 text-sm rounded border border-green-200"
            >
&lt;div class="my-content"&gt;
  &lt;app-safe-html [content]="htmlContent"&gt;&lt;/app-safe-html&gt;  &lt;!-- GOOD! --&gt;
&lt;/div&gt;</pre
            >
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: `
    pre {
      white-space: pre-wrap;
      word-break: break-word;
    }
  `,
})
export class ExampleSafeHtmlComponent {
  // Sample HTML strings
  basicExample = signal(
    '<p>This is a basic <strong>HTML</strong> paragraph with some emphasis.</p>'
  );

  richTextExample = signal(`
    <h3>Article Title</h3>
    <p>This is the first paragraph with some <strong>bold text</strong> and <em>italic text</em>.</p>
    <p>Here's a second paragraph with a <a href="https://example.com">link</a>.</p>
    <ul>
      <li>List item 1</li>
      <li>List item 2</li>
      <li>List item 3</li>
    </ul>
  `);

  nestedExample = signal(`
    <div class="article">
      <div class="article-header">
        <h3>Nested Structure Example</h3>
      </div>
      <div class="article-body">
        <p>This content has nested divs that will be properly handled.</p>
        <div class="quote">
          <p>This is a nested quote that might cause hydration issues if not properly handled.</p>
        </div>
      </div>
    </div>
  `);

  mixedExample = signal(`
    <p>This paragraph has embedded formatting including:</p>
    <ul>
      <li><strong>Bold text</strong> within a list item</li>
      <li>An <em>emphasized point</em> worth noting</li>
      <li>Mixed <strong>bold and <em>italic</em> nested</strong> formatting</li>
    </ul>
    <div style="color: red; font-size: 18px;">
      This div has inline styles that will be stripped for security.
    </div>
    <script>alert('This script will be removed!');</script>
  `);
}
