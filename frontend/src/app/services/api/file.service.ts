import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { IProject } from '../../types';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private apiService: ApiService = inject(ApiService);

  private url = `/api/file/`;

  constructor() {}

  getFiles(): Observable<any[]> {
    return this.apiService.get(this.url);
  }
  getProjectFiles(projectId: IProject['_id']): Observable<any[]> {
    return this.apiService.get(`/api/project/${projectId}/files`);
  }

  upload(model: any, id: any, body: any): Observable<any> {
    return this.apiService.post(`${this.url}upload/${model}/${id}`, body, {
      responseType: 'json',
      withCredentials: true,
    });
  }
  docFileUpload(documentationId: any, body: any): Observable<any> {
    return this.apiService.post(
      `/api/documentation/${documentationId}/upload`,
      body,
      {
        responseType: 'json',
        withCredentials: true,
      }
    );
  }
  chapterFileUpload(
    documentationId: any,
    chapterId: any,
    body: any
  ): Observable<any> {
    return this.apiService.post(
      `/api/chapter/${documentationId}/${chapterId}/upload`,
      body,
      {
        responseType: 'json',
        withCredentials: true,
      }
    );
  }
}
