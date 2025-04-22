import { CommonModule } from '@angular/common';
import { Component, HostBinding, inject } from '@angular/core';
import { take } from 'rxjs/operators';
import { AlertService } from './alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent {
  _alertService = inject(AlertService);

  showAlert$ = this._alertService.showAlert$;
  alertConfig$ = this._alertService.alertConfig$;

  @HostBinding('class.visible')
  get isVisible() {
    return this._alertService.showAlertSubject$.getValue();
  }

  onConfirm() {
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      if (config?.onConfirm) {
        config.onConfirm();
      }
      this._alertService.hide();
    });
  }

  onCancel() {
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      if (config?.onCancel) {
        config.onCancel();
      }
      this._alertService.hide();
    });
  }
}
