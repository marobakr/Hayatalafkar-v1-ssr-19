import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.css',
})
export class ServiceCardComponent {
  @Input({ required: true }) cardTitle: string = '';
  @Input({ required: true }) cardDescription: string = '';
  @Input({ required: true }) cardImagePath: string = '';
  @Input({ required: true }) isCenter: boolean = false;
}
