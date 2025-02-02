import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiService: ApiService = inject(ApiService);

  private url = `/api/dashboard/`;

  dashboardDataSubject = new BehaviorSubject<any>(null);
  dashboardData$ = this.dashboardDataSubject.asObservable();

  constructor() {}

  get(): Observable<any> {
    return this.apiService.get(this.url);
  }
}
