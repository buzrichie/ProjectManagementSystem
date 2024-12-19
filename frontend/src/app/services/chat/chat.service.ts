import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { IChatRoom, IProject } from '../../types';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiService = inject(ApiService);
  private url = `/api/chatroom/`;

  messagesSubject = new BehaviorSubject<any[]>([]);
  messages$ = this.messagesSubject.asObservable();

  chatListSubject = new BehaviorSubject<IProject[]>([]);
  chatList$ = this.chatListSubject.asObservable();

  currentChatSubject = new BehaviorSubject<IChatRoom | null>(null);
  currentChat$ = this.currentChatSubject.asObservable();

  private chatLayoutSubject = new BehaviorSubject<boolean>(false);
  chatLayout$ = this.chatLayoutSubject.asObservable();

  constructor() {
    // this.socket = io(environment.backendUrl, {
    //   query: { token: this.token || '' },
    //   transports: ['websocket', 'polling'],
    // });
  }

  getChatRooms<IProject>(): Observable<IProject[]> {
    return this.apiService.get(this.url);
  }

  // joinTeam(chatRoomId: string) {
  //   this.socket.emit('join team', { chatRoomId });
  // }

  // sendMessage(chatRoomId: string, content: string) {
  //   this.socket.emit('team message', { chatRoomId, content });
  // }

  // onMessage(callback: (message: any) => void) {
  //   this.socket.on('team message', callback);
  // }

  // disconnect() {
  //   this.socket.disconnect();
  // }

  getMessage(chatRoomId: string) {
    // Fetch message history
    return this.apiService.get<any[]>(`${this.url}${chatRoomId}`);
  }
  // Add participants to a chat room
  addParticipantsToChatRoom(
    chatRoomId: string,
    participantIds: string[]
  ): Observable<any> {
    return this.apiService.post(`${this.url}${chatRoomId}/participants`, {
      participants: participantIds,
    });
  }
}
