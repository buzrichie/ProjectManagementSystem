import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SocketIoService {
  private socket: Socket;
  private authService = inject(AuthService);

  private token = this.authService.authAccessTokenSubject.value;

  constructor() {
    this.socket = io(environment.backendUrl, {
      query: { token: this.token || '' },
      transports: ['websocket', 'polling'],
    });
  }

  joinTeam(chatRoomId: string) {
    this.socket.emit('join team', { chatRoomId });
  }

  sendMessage(chatRoomId: string, content: string) {
    console.log({ chatRoomId, content });

    this.socket.emit('team message', { chatRoomId, content });
  }

  onMessage(callback: (message: any) => void) {
    this.socket.on('team message', callback);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
