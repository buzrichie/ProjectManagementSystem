import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SocketIoService {
  private socket!: Socket;
  private authService = inject(AuthService);

  constructor() {
    // Wait for the token to become available
    this.authService.authAccessTokenSubject.subscribe((token) => {
      if (token) {
        this.initializeSocket(token);
      }
    });
  }

  private initializeSocket(token: string) {
    if (this.socket) {
      this.socket.disconnect(); // Disconnect any existing socket
    }
    this.socket = io(environment.backendUrl, {
      query: { token },
      transports: ['websocket', 'polling'],
    });

    // Optionally log connection status
    this.socket.on('connect', () => console.log('Socket connected'));
    this.socket.on('connect_error', (err) =>
      console.error('Socket connection error:', err)
    );
  }

  joinConversation(chatroomId: string) {
    console.log(chatroomId);

    this.socket.emit('joinConversation', chatroomId);
  }

  sendMessage(
    chatroomId: string,
    content: string,
    receiverId: string | null = null
  ) {
    this.socket.emit('sendMessage', { chatroomId, content, receiverId });
  }

  onMessage(callback: (message: any) => void) {
    this.socket.on('newMessage', callback);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
