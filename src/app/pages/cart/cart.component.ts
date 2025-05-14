import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LanguageService } from '@core/services/lang/language.service';
import { CartStateService } from '../../core/services/common/cart-state.service';
import { ArticlesHeaderComponent } from '../articles/components/articles-header/articles-header.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ArticlesHeaderComponent,
    AsyncPipe,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  _cartState = inject(CartStateService);

  _languageService = inject(LanguageService);

  formBuilder = inject(FormBuilder);

  currentLang$ = this._languageService.getLanguage();

  promoCodeForm: FormGroup = this.formBuilder.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
  });

  promoCodeError: string | null = null;
  promoCodeSuccess: string | null = null;

  updateQuantity(productId: string | number, quantity: number) {
    if (quantity > 0) {
      this._cartState.updateQuantity(productId, quantity).subscribe();
    } else {
      this.removeItem(productId);
    }
  }

  removeItem(productId: string | number) {
    this._cartState.removeItem(productId).subscribe();
  }

  clearCart() {
    this._cartState.clearCart().subscribe();
  }

  applyPromoCode() {
    if (this.promoCodeForm.valid) {
      const code = this.promoCodeForm.get('code')?.value;
      this.promoCodeError = null;
      this.promoCodeSuccess = null;

      this._cartState.applyPromoCode(code).subscribe({
        next: (response) => {
          if (response.valid) {
            this.promoCodeSuccess = 'Promo code applied successfully!';
            this.promoCodeForm.reset();
          } else {
            this.promoCodeError = response.message || 'Invalid promo code.';
          }
        },
        error: () => {
          this.promoCodeError = 'Error applying promo code. Please try again.';
        },
      });
    }
  }
}
