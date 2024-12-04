import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  spinnerSubject = new BehaviorSubject(false);
  spinner$ = this.spinnerSubject.asObservable();
  private requests = 0;

  show() {
    this.requests++;
    if (this.requests === 1) {
      // console.log('spinner show');
      this.spinnerSubject.next(true);
    }
  }

  hide() {
    this.requests--;
    if (this.requests === 0) {
      // console.log('spinner hide');
      this.spinnerSubject.next(false);
    }
  }
  skip() {
    this.requests--;
    if (this.requests === 0) {
      // console.log('spinner hide');
      this.spinnerSubject.next(false);
    }
  }
  reset() {
    this.requests = 0;
  }
}
