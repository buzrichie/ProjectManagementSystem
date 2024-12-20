import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { ITeam, IUser } from '../../types';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private apiService: ApiService = inject(ApiService);

  private url = `/api/team/members/`;
  private searchTerms = new Subject<string>();

  memberListSubject = new BehaviorSubject<IUser[]>([]);
  memberList$ = this.memberListSubject.asObservable();
  constructor() {}

  searchUsers(term: string): void {
    this.searchTerms.next(term);
  }
  queryUsers(): Observable<IUser[]> {
    return this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        return this.apiService.get<IUser[]>(`/api/user/?query=${term}`);
      })
    );
  }

  getMembers<IUser>(teamId: ITeam['_id']): Observable<IUser[]> {
    return this.apiService.get(`${this.url}${teamId}`);
  }
  getProjectMembers<IUser>(id: string): Observable<IUser[]> {
    return this.apiService.get(`/api/project/${id}/members`);
  }
  getMember<IUser>(id: string): Observable<IUser> {
    return this.apiService.get(`${this.url}${id}`);
  }

  post(memberIds: IUser['_id'][], teamId: ITeam['_id']): Observable<IUser> {
    return this.apiService.post(
      `${this.url}${teamId}`,
      { memberIds },
      {
        responseType: 'json',
        withCredentials: true,
      }
    );
  }

  /**
   *
   * @param id `id` of the User that will be deleted
   * @param user Id of `user` requesting for the delete
   * @returns An `Observable` of the response, with the response body of type `User`.
   */
  delete(id: IUser['_id'], teamId: ITeam['_id']): Observable<IUser> {
    return this.apiService.delete(`${this.url}${id}/${teamId}`, {
      responseType: 'json',
      withCredentials: true,
    });
  }
}
