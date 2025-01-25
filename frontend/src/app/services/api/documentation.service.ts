import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { IDocumentation } from '../../types';

@Injectable({
  providedIn: 'root',
})
export class DocumentationService {
  private apiService: ApiService = inject(ApiService);

  private url = `/api/documentation/`;

  docsListSubject = new BehaviorSubject<IDocumentation[]>([]);
  docsList$ = this.docsListSubject.asObservable();

  constructor() {}

  getDocs(): Observable<any[]> {
    return this.apiService.get(this.url);
  }
  getDocu<IDocumentation>(id: string): Observable<IDocumentation> {
    return this.apiService.get(`${this.url}${id}`);
  }
  getGroupDocu<IDocumentation>(id: string): Observable<IDocumentation> {
    return this.apiService.get(`${this.url}group/${id}`);
  }
  getProjectFiles(projectId: IDocumentation['_id']): Observable<any[]> {
    return this.apiService.get(`/api/project/${projectId}/files`);
  }

  upload(model: any, id: any, body: any): Observable<any> {
    return this.apiService.post(`${this.url}upload/${model}/${id}`, body, {
      responseType: 'json',
      withCredentials: true,
    });
  }
}
