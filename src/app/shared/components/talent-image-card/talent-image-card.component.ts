import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-talent-image-card',
  standalone: true,
  imports: [],
  templateUrl: './talent-image-card.component.html',
  styleUrl: './talent-image-card.component.css',
})
export class TalentImageCardComponent {
  @Input({ required: true }) imagePath!: string;
}
