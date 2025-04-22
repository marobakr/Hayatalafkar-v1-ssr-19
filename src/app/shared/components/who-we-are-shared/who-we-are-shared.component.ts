import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SloganComponent } from '../slogan/slogan.component';

@Component({
  selector: 'app-who-we-are-shared',
  standalone: true,
  imports: [NgClass, SloganComponent, TranslateModule],
  templateUrl: './who-we-are-shared.component.html',
  styleUrl: './who-we-are-shared.component.css',
})
export class WhoWeAreSharedComponent {
  @Input({ required: true }) showBgImage: boolean = false;
  @Input({ required: true }) sloganText: string = '';
  @Input({ required: true }) showSloganText: boolean = true;
}
