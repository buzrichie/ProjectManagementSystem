import { inject, Injectable } from '@angular/core';
import { IProject, IUser } from '../../types';
import { ApiService } from './api.service';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  apiService = inject(ApiService);
  private url = `/api/user/`;
  private searchTerms = new Subject<string>();
  private searchAdminTerms = new Subject<string>();

  adminListSubject = new BehaviorSubject<IUser[] | null>([]);
  adminList$ = this.adminListSubject.asObservable();

  userListSubject = new BehaviorSubject<IUser[]>([]);
  userList$ = this.userListSubject.asObservable();

  cUserSubject = new BehaviorSubject<IUser | null>(null);
  cUser$ = this.cUserSubject.asObservable();

  constructor() {}

  searchMenbers(term: string): void {
    this.searchTerms.next(term);
  }
  getMenbers(): Observable<IUser[]> {
    return this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        return this.apiService.get<IUser[]>(`${this.url}?query=${term}`);
      })
    );
  }

  searchUsers(term: string): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.url}?query=${term}`);
  }

  getUsersByRole(role: string): Observable<IUser[]> {
    return this.apiService.get<IUser[]>(`${this.url}${role}`);
  }

  searchAdmins(term: string): void {
    console.log(term);

    this.searchAdminTerms.next(term);
  }
  getAdmins(): Observable<IUser[]> {
    return this.searchAdminTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        return this.apiService.get<IUser[]>(
          `${this.url}role-admins/?query=${term}`
        );
      })
    );
  }

  getUsers<IUser>(): Observable<IUser[]> {
    return this.apiService.get(this.url, {
      responseType: 'json',
      withCredentials: true,
    });
  }
  getOne<IUser>(path: string): Observable<IUser> {
    return this.apiService.get(`${this.url}${path}`, {
      responseType: 'json',
      withCredentials: true,
    });
  }

  post(body: IUser): Observable<IUser> {
    return this.apiService.post(this.url, body, {
      responseType: 'json',
      withCredentials: true,
    });
  }
  assignProjectToUser(project: IProject['name']): Observable<IProject> {
    return this.apiService.post(
      `${this.url}assign-project/${project}`,
      {},
      {
        responseType: 'json',
        withCredentials: true,
      }
    );
  }
  assignSupervisorToStudent(body: any): Observable<IProject> {
    return this.apiService.post(`${this.url}assign-supervisor`, body, {
      responseType: 'json',
      withCredentials: true,
    });
  }

  put(id: string, body: IUser): Observable<IUser> {
    return this.apiService.put(`${this.url}${id}`, body, {
      responseType: 'json',
      withCredentials: true,
    });
  }

  /**
   *
   * @param id `id` of the User that will be deleted
   * @returns An `Observable` of the response, with the response body of type `IUser`.
   */
  delete(id: string): Observable<IUser> {
    return this.apiService.delete(`${this.url}${id}`, {
      responseType: 'json',
      withCredentials: true,
    });
  }
}
