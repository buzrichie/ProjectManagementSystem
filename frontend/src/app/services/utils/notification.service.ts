import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  newNotificationSubject = new Subject<any>();
  newNotification$ = this.newNotificationSubject.asObservable();
  constructor() {}

  setNewNotification(notice: string) {
    this.newNotificationSubject.next(notice);
  }
}
