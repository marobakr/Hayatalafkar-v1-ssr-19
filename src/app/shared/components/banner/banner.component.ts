import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
})
export class BannerComponent {
  @Input({ required: true }) bannerText: string = '';
  @Input({ required: true }) showLeftSideImage: boolean = true;
  @Input({ required: true }) showRightSideImage: boolean = true;
}
