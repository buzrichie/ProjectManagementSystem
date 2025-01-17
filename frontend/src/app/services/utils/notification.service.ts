import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private url = `/api/notification/`;
  newNotificationSubject = new Subject<any>();
  newNotification$ = this.newNotificationSubject.asObservable();
  constructor(private apiService: ApiService) {}

  // Fetch notifications for the logged-in user

  getNotifications(): Observable<any> {
    return this.apiService.get(`${this.url}`);
  }
  setNewNotification(notice: string) {
    this.newNotificationSubject.next(notice);
  }
}
