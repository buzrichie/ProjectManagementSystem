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
import { IProject } from '../../types';
import { ToastService } from '../utils/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiService: ApiService = inject(ApiService);
  private toast = inject(ToastService);

  private url = `/api/project/`;
  private searchTerms = new Subject<string>();

  projectListSubject = new BehaviorSubject<IProject[]>([]);
  projectList$ = this.projectListSubject.asObservable();
  cprojectSubject = new BehaviorSubject<IProject | null>(null);
  cproject$ = this.cprojectSubject.asObservable();

  searchProjects(term: string): void {
    this.searchTerms.next(term);
  }

  getProjectsByQuery(): Observable<IProject[]> {
    return this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        return this.apiService.get<IProject[]>(`${this.url}?query=${term}`);
      })
    );
  }

  getProjects<IProject>(
    page: number,
    pageSize: number
  ): Observable<IProject[]> {
    return this.apiService.get(`${this.url}?page=${page}&limit=${pageSize}`);
  }

  getOne<IProject>(id: string): Observable<IProject> {
    return this.apiService.get(`${this.url}${id}`);
  }

  post(body: IProject): Observable<{
    message: string;
    project: IProject;
  }> {
    return this.apiService.post(this.url, body, {
      responseType: 'json',
      withCredentials: true,
    });
  }
  assignProjectbySelect(project: IProject['name']): Observable<IProject> {
    return this.apiService.post(
      `${this.url}${project}/assign-by-select`,
      {},
      {
        responseType: 'json',
        withCredentials: true,
      }
    );
  }

  put(id: string, body: IProject): Observable<IProject> {
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
  delete(id: string): Observable<IProject> {
    return this.apiService.delete(`${this.url}${id}`, {
      responseType: 'json',
      withCredentials: true,
    });
  }

  assignProjectToTeam(body: string) {
    return this.apiService.post(`${this.url}assign`, body);
  }
}
