import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ToastService } from '../utils/toast.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IProjectBrief } from '../../types';

@Injectable({
  providedIn: 'root',
})
export class ProjectBriefService {
  private apiService: ApiService = inject(ApiService);
  private toast = inject(ToastService);

  private url = `/api/project-brief/`;
  private searchTerms = new Subject<string>();

  projectListSubject = new BehaviorSubject<IProjectBrief[]>([]);
  projectList$ = this.projectListSubject.asObservable();
  cprojectSubject = new BehaviorSubject<IProjectBrief | null>(null);
  cproject$ = this.cprojectSubject.asObservable();

  searchProjects(term: string): void {
    this.searchTerms.next(term);
  }

  getProjects<IProjectBrief>(
    page: number,
    pageSize: number
  ): Observable<IProjectBrief[]> {
    return this.apiService.get(`${this.url}?page=${page}&limit=${pageSize}`);
  }

  getOne<IProjectBrief>(id: string): Observable<IProjectBrief> {
    return this.apiService.get(`${this.url}${id}`);
  }

  post(body: IProjectBrief): Observable<{
    message: string;
    project: IProjectBrief;
  }> {
    return this.apiService.post(this.url, body, {
      responseType: 'json',
      withCredentials: true,
    });
  }

  put(id: string, body: IProjectBrief): Observable<IProjectBrief> {
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
  delete(id: string): Observable<IProjectBrief> {
    return this.apiService.delete(`${this.url}${id}`, {
      responseType: 'json',
      withCredentials: true,
    });
  }
}
