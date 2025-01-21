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
import { IGroup } from '../../types';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiService: ApiService = inject(ApiService);

  private url = `/api/group/`;
  private searchTerms = new Subject<string>();

  teamListSubject = new BehaviorSubject<IGroup[]>([]);
  teamList$ = this.teamListSubject.asObservable();
  constructor() {}

  searchTeams(term: string): void {
    this.searchTerms.next(term);
  }
  getTeams(): Observable<IGroup[]> {
    return this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        return this.apiService.get<IGroup[]>(`${this.url}?query=${term}`);
      })
    );
  }

  get<ITeam>(page: number, pageSize: number): Observable<ITeam[]> {
    return this.apiService.get(`${this.url}?page=${page}&limit=${pageSize}`);
  }
  getProjectTeams<ITeam>(id: string): Observable<ITeam[]> {
    return this.apiService.get(`/api/project/${id}/group`);
  }
  getOne<ITeam>(id: string): Observable<ITeam> {
    return this.apiService.get(`${this.url}${id}`);
  }

  post(body: IGroup): Observable<IGroup> {
    return this.apiService.post(this.url, body, {
      responseType: 'json',
      withCredentials: true,
    });
  }

  put(id: string, body: IGroup): Observable<IGroup> {
    return this.apiService.put(`${this.url}${id}`, body, {
      responseType: 'json',
      withCredentials: true,
    });
  }

  /**
   *
   * @param id `id` of the User that will be deleted
   * @param user Id of `user` requesting for the delete
   * @returns An `Observable` of the response, with the response body of type `User`.
   */
  delete(id: string): Observable<IGroup> {
    return this.apiService.delete(`${this.url}${id}`, {
      responseType: 'json',
      withCredentials: true,
    });
  }
}
