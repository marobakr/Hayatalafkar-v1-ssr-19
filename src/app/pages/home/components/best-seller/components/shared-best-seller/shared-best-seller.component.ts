import { PercentPipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ImageUrlDirective } from '@core/directives/image-url.directive';
import { FilterHtmlPipe } from '@core/pipes/filter-html.pipe';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { ApiService } from '@core/services/conf/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { BestProduct } from 'src/app/pages/home/res/home.interfaces';
import { IAllProduct } from 'src/app/pages/shopping/res/products.interface';
@Component({
  selector: 'app-shared-best-seller',
  standalone: true,
  imports: [
    TranslateModule,
    CustomTranslatePipe,
    PercentPipe,
    FilterHtmlPipe,
    ImageUrlDirective,
  ],
  templateUrl: './shared-best-seller.component.html',
  styleUrl: './shared-best-seller.component.css',
})
export class SharedBestSellerComponent {
  _apiService = inject(ApiService);

  @Input({ required: true }) productData: IAllProduct | BestProduct =
    {} as IAllProduct;
}
