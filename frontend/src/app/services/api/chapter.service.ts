import { inject, Injectable } from '@angular/core';
import { IChapter } from '../../types';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChapterService {
  private apiService: ApiService = inject(ApiService);

  private url = `/api/chapter/`;

  chapterListSubject = new BehaviorSubject<IChapter[]>([]);
  chapterList$ = this.chapterListSubject.asObservable();

  constructor() {}

  put(id: string, body: IChapter): Observable<IChapter> {
    return this.apiService.put(`${this.url}${id}`, body, {
      responseType: 'json',
      withCredentials: true,
    });
  }
  postFeed(id: any, body: any): Observable<any> {
    return this.apiService.post(`${this.url}/${id}/feedback`, body, {
      responseType: 'json',
      withCredentials: true,
    });
  }
}
