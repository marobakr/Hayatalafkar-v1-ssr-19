import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-app-search',
  imports: [FormsModule, NgIf],
  templateUrl: './app-search.component.html',
  styleUrl: './app-search.component.css',
})
export class AppSearchComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();

  searchQuery = '';

  onClose(): void {
    this.searchQuery = '';
    this.close.emit();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.search.emit(this.searchQuery);
      this.searchQuery = '';
    }
  }
}
