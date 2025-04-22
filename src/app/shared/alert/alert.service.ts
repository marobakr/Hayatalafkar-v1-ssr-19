import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AlertConfig {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private showAlertSubject = new BehaviorSubject<boolean>(false);
  private alertConfigSubject = new BehaviorSubject<AlertConfig | null>(null);

  showAlertSubject$ = this.showAlertSubject;
  showAlert$ = this.showAlertSubject.asObservable();
  alertConfig$ = this.alertConfigSubject.asObservable();

  show(config: AlertConfig) {
    this.alertConfigSubject.next(config);
    this.showAlertSubject.next(true);
  }

  hide() {
    this.showAlertSubject.next(false);
    this.alertConfigSubject.next(null);
  }
}
