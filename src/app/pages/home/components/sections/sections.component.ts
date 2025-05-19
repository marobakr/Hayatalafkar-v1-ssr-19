import { Component, Input } from '@angular/core';
import { ICategory } from '@core/interfaces/common.model';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent } from '@shared/components/card/card.component';

@Component({
  selector: 'app-sections',
  standalone: true,
  imports: [CardComponent, TranslateModule, CustomTranslatePipe],
  templateUrl: './sections.component.html',
  styleUrl: './sections.component.css',
})
export class SectionsComponent {
  @Input({ required: true }) categories: ICategory[] = [];
}
