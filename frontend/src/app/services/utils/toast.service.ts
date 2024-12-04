import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  isActiveToastSubject = new BehaviorSubject<{} | null>(null);
  isActiveToast$ = this.isActiveToastSubject.asObservable();
  constructor() {}

  success(message: string) {
    this.isActiveToastSubject.next({ success: true, message });
    this.toastTimeOut(1500);
  }
  warning(message: string) {
    this.isActiveToastSubject.next({ warning: true, message });
    this.toastTimeOut(1500);
  }
  info(message: string) {
    this.isActiveToastSubject.next({ info: true, message });
    this.toastTimeOut(1500);
  }
  danger(message: string) {
    this.isActiveToastSubject.next({ danger: true, message });
  }
  toastTimeOut(value: number = 100) {
    setTimeout(() => this.isActiveToastSubject.next({}), value);
  }
  reset() {
    if (this.isActiveToastSubject.getValue()) {
      this.isActiveToastSubject.next(null);
    }
  }
}
