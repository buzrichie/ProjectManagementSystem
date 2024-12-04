import { inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { ApiService } from '../api/api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { IProject } from '../../types';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket;
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private url = `/api/messages/`;

  messagesSubject = new BehaviorSubject<any[]>([]);
  messages$ = this.messagesSubject.asObservable();

  chatListSubject = new BehaviorSubject<IProject[]>([]);
  chatList$ = this.chatListSubject.asObservable();

  currentProjectSubject = new BehaviorSubject<IProject | null>(null);
  currentProject$ = this.currentProjectSubject.asObservable();

  private token = this.authService.authAccessTokenSubject.value;

  constructor() {
    this.socket = io(environment.backendUrl, {
      query: { token: this.token || '' },
      transports: ['websocket', 'polling'],
    });
  }

  getChatProjects<IProject>(): Observable<IProject[]> {
    return this.apiService.get(`/api/project/chat`);
  }

  joinTeam(teamId: string) {
    console.log('join');

    this.socket.emit('join team', { teamId });
  }

  sendMessage(teamId: string, message: string) {
    this.socket.emit('team message', { teamId, message });
  }

  onMessage(callback: (message: any) => void) {
    this.socket.on('team message', callback);
  }

  disconnect() {
    this.socket.disconnect();
  }

  getMessage(teamId: string) {
    // Fetch message history
    return this.apiService.get<any[]>(`${this.url}${teamId}`);
  }
}
