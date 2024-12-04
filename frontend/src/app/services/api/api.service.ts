import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of } from 'rxjs';
import { IUser, apiOptions } from '../../types';
import { environment } from '../../../environments/environment';
// import { ToastService } from '../toast.service';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // toast = inject(ToastService);

  private backendUrl = environment.backendUrl;
  users: any[] = [];
  projects: any[] = [];
  services: any[] = [];
  tools: any[] = [];
  profile!: object;
  achievements: any[] = [];
  clientSettings: any = null;
  isAuthorized: boolean = false;
  // isAuthorizedUser = new BehaviorSubject<User| null>(null)
  userSubject = new BehaviorSubject<IUser | null>(null);
  user = this.userSubject.asObservable();
  isuser = new BehaviorSubject<boolean>(false);

  constructor(private httpClient: HttpClient) {}

  /**
   * Generic GET request function
   * @param url The URL to make the request to
   * @param options The options for the request
   * @returns An Observable of the response data
   */
  get<T>(
    url: string,
    option: apiOptions = {
      responseType: 'json',
      withCredentials: true,
    }
  ): Observable<T> {
    // Pass the request options and return the response as an Observable of type T
    return this.httpClient
      .get<T>(`${this.backendUrl}${url}`, {
        responseType: 'json',
        withCredentials: true,
      })
      .pipe(
        catchError((err): Observable<any> => {
          // this.toast.danger(err.message);
          return err;
        })
      ) as Observable<T>;
  }
  post<T>(
    url: string,
    body: any,
    option: apiOptions = {
      responseType: 'json',
      withCredentials: true,
    }
  ): Observable<T> {
    return this.httpClient.post(
      `${this.backendUrl}${url}`,
      body,
      option
    ) as Observable<T>;
  }
  put<T>(url: string, body: any, option: apiOptions): Observable<T> {
    return this.httpClient.put(`${this.backendUrl}${url}`, body, option).pipe(
      catchError((err): Observable<T> => {
        // this.toast.danger(err.message);
        return err;
      })
    ) as Observable<T>;
  }
  delete<T>(url: string, option: apiOptions): Observable<T> {
    return this.httpClient.delete(`${this.backendUrl}${url}`, option).pipe(
      catchError((err): Observable<T> => {
        // this.toast.danger(err.message);
        return err;
      })
    ) as Observable<T>;
  }
}
