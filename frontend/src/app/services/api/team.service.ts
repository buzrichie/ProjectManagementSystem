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
import { ITeam } from '../../types';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiService: ApiService = inject(ApiService);

  private url = `/api/team/`;
  private searchTerms = new Subject<string>();

  teamListSubject = new BehaviorSubject<ITeam[]>([]);
  teamList$ = this.teamListSubject.asObservable();
  constructor() {}

  searchTeams(term: string): void {
    this.searchTerms.next(term);
  }
  getTeams(): Observable<ITeam[]> {
    return this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        return this.apiService.get<ITeam[]>(`${this.url}?query=${term}`);
      })
    );
  }

  get<ITeam>(): Observable<ITeam[]> {
    return this.apiService.get(this.url);
  }
  getProjectTeams<ITeam>(id: string): Observable<ITeam[]> {
    return this.apiService.get(`/api/project/${id}/team`);
  }
  getOne<ITeam>(id: string): Observable<ITeam> {
    return this.apiService.get(`${this.url}${id}`);
  }

  post(body: ITeam): Observable<ITeam> {
    return this.apiService.post(this.url, body, {
      responseType: 'json',
      withCredentials: true,
    });
  }

  put(id: string, body: ITeam): Observable<ITeam> {
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
  delete(id: string): Observable<ITeam> {
    return this.apiService.delete(`${this.url}${id}`, {
      responseType: 'json',
      withCredentials: true,
    });
  }
}
