import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-arrow-button',
  standalone: true,
  imports: [],
  templateUrl: './arrow-button.component.html',
  styleUrl: './arrow-button.component.css',
})
export class ArrowButtonComponent {
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) px: string = '';
  @Input({ required: true }) py: string = '';
  @Input({ required: true }) type: string = '';
  @Input({ required: true }) gap: string = '';
  @Input({ required: true }) border: string = '';
  @Input({ required: true }) bg: string = '';
  @Input({ required: true }) color: string = '';
  @Input({ required: true }) image: string = '';
  @Input() disabled: boolean = false;
}
