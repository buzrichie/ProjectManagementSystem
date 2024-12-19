import { inject, Injectable } from '@angular/core';
import {
  Subject,
  BehaviorSubject,
  Observable,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs';
import { ITask, IProject } from '../../types';
import { ToastService } from '../utils/toast.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class SubtaskService {
  private apiService: ApiService = inject(ApiService);
  private toast = inject(ToastService);

  private url = `/api/subtask/`;
  private searchTerms = new Subject<string>();

  taskListSubject = new BehaviorSubject<ITask[]>([]);
  taskList$ = this.taskListSubject.asObservable();

  searchTasks(term: string): void {
    console.log(term);

    this.searchTerms.next(term);
  }
  getTasks(): Observable<ITask[]> {
    return this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        return this.apiService.get<ITask[]>(`${this.url}?query=${term}`);
      })
    );
  }

  get<ITask>(): Observable<ITask[]> {
    return this.apiService.get(this.url);
  }
  getProjectTasks<ITask>(id: string): Observable<ITask[]> {
    return this.apiService.get(`/api/project/${id}/task`);
  }
  getOne<ITask>(id: string): Observable<ITask> {
    return this.apiService.get(`${this.url}${id}`);
  }

  post(body: ITask, taskId: ITask['_id']): Observable<ITask> {
    return this.apiService.post(`${this.url}${taskId}`, body, {
      responseType: 'json',
      withCredentials: true,
    });
  }
  taskUpload(body: any, task: ITask['_id']): Observable<ITask> {
    return this.apiService.post(`/api/file/upload/task/${task}`, body, {
      responseType: 'json',
      withCredentials: true,
    });
  }

  put(id: string, body: ITask): Observable<ITask> {
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
  delete(id: string): Observable<ITask> {
    return this.apiService.delete(`${this.url}${id}`, {
      responseType: 'json',
      withCredentials: true,
    });
  }

  assignTaskToTeam(body: string) {
    return this.apiService.post(`${this.url}assign`, body);
  }
}
