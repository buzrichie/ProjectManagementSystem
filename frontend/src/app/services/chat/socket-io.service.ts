import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../utils/notification.service';

@Injectable({
  providedIn: 'root',
})
export class SocketIoService {
  private socket!: Socket;
  private authService = inject(AuthService);
  notificationService = inject(NotificationService);

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
    this.socket.emit('notification', 'new:project');
  }

  joinConversation(chatroomId: string) {
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
  onNotification() {
    this.socket.on('new:notification', (data) => {
      this.notificationService.setNewNotification(data);
      console.log(data);
    });
    this.socket.on('new:project', (data) => {
      this.notificationService.setNewNotification(data);
      console.log(data);
    });
    this.socket.on('project_assigned', (data) => {
      this.notificationService.setNewNotification(data);
      console.log(data);
    });
    this.socket.on('assigned:new:supervisor', (data) => {
      this.notificationService.setNewNotification(data);
      console.log(data);
    });
    this.socket.on('assigned:new:student', (data) => {
      this.notificationService.setNewNotification(data);
      console.log(data);
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
