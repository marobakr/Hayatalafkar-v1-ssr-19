import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-shared-best-seller',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './shared-best-seller.component.html',
  styleUrl: './shared-best-seller.component.css',
})
export class SharedBestSellerComponent {
  @Input({ required: true }) imgPath: string = '';
  @Input({ required: true }) isOffer: boolean = false;
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) description: string = '';
}
