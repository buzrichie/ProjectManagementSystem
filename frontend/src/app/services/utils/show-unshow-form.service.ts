import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShowUnshowFormService {
  showFormSubject = new BehaviorSubject<boolean>(false);
  showForm$ = this.showFormSubject.asObservable();
  constructor() {}

  enable() {
    if (!this.showFormSubject.getValue()) {
      this.showFormSubject.next(true);
    }
  }
  disable() {
    if (this.showFormSubject.getValue()) {
      this.showFormSubject.next(false);
    }
  }
}
