import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-articles-card-shared',
  standalone: true,
  imports: [NgClass, TranslateModule],
  templateUrl: './articles-card-shared.component.html',
  styleUrl: './articles-card-shared.component.css',
})
export class ArticlesCardSharedComponent {
  @Input({ required: true }) haveMoreMarginBottom: boolean = true;
  @Input({ required: true }) articleImage: string = '';
  @Input({ required: true }) articleTitle: string = '';
  @Input({ required: true }) articleDescription: string = '';
  @Input({ required: true }) articleDate: string = '';
}
