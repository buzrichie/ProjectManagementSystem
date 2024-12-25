import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViewportService {
  private viewportWidthSubject = new BehaviorSubject<boolean>(false);
  viewportWidth$ = this.viewportWidthSubject.asObservable();

  constructor() {}
}
