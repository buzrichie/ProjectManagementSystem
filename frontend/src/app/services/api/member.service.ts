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
import { IGroup, IProject, IUser } from '../../types';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private apiService: ApiService = inject(ApiService);

  private url = `/api/team/members/`;
  private searchTerms = new Subject<string>();

  memberListSubject = new BehaviorSubject<IUser[]>([]);
  memberList$ = this.memberListSubject.asObservable();
  projectMemberListSubject = new BehaviorSubject<
    { _id: IProject['_id']; members: IUser[] }[]
  >([]);
  projectMemberList$ = this.projectMemberListSubject.asObservable();
  groupMemberListSubject = new BehaviorSubject<
    { _id: IGroup['_id']; members: IUser[] }[]
  >([]);
  groupMemberList$ = this.groupMemberListSubject.asObservable();
  constructor() {}

  searchUsers(term: string): void {
    this.searchTerms.next(term);
  }
  queryUsers(): Observable<IUser[]> {
    return this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        return this.apiService.get<IUser[]>(`/api/user/public/?search=${term}`);
      })
    );
  }

  getGroupMembers<IUser>(
    groupId: IGroup['_id']
  ): Observable<{ _id: IGroup['_id']; members: IUser[] }> {
    return this.apiService.get(`/api/group/${groupId}/members`);
  }
  getProjectMembers<IUser>(
    id: IProject['_id']
  ): Observable<{ data: { _id: IProject['_id']; members: IUser[] } }> {
    return this.apiService.get(`/api/project/${id}/members`);
  }
  getMember<IUser>(id: string): Observable<IUser> {
    return this.apiService.get(`${this.url}${id}`);
  }

  post(memberIds: IUser['_id'][], groupId: IGroup['_id']): Observable<IUser> {
    return this.apiService.post(
      `${this.url}${groupId}`,
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
  delete(id: IUser['_id'], groupId: IGroup['_id']): Observable<IUser> {
    return this.apiService.delete(`${this.url}${id}/${groupId}`, {
      responseType: 'json',
      withCredentials: true,
    });
  }
}
