import { Component } from '@angular/core';
import { BaseBannerComponent } from '@shared/ts/baseBanner';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
})
export class BannerComponent extends BaseBannerComponent {}
