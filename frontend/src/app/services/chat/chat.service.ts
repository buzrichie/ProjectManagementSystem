import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { IChatRoom, IMessage, IProject, IUser } from '../../types';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiService = inject(ApiService);
  private url = `/api/chatroom/`;
  private url2 = `/api/message/`;

  messagesSubject = new BehaviorSubject<
    { chatRoomId: IChatRoom['_id']; messages: IMessage[] }[]
  >([]);
  messages$ = this.messagesSubject.asObservable();

  cMessagesSubject = new BehaviorSubject<{
    chatRoomId: IChatRoom['_id'];
    messages: IMessage[];
  } | null>(null);
  cMessages$ = this.cMessagesSubject.asObservable();

  chatListSubject = new BehaviorSubject<IChatRoom[]>([]);
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

  getChatRooms<IChatRoom>(): Observable<IChatRoom[]> {
    return this.apiService.get(this.url);
  }

  createChatRoom(receipientId: IUser['_id']): Observable<IChatRoom> {
    return this.apiService.post(
      `${this.url}${receipientId}`,
      {},
      {
        responseType: 'json',
        withCredentials: true,
      }
    );
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
    return this.apiService.get<IMessage[]>(`${this.url2}${chatRoomId}`);
  }
  getOrCreateChatroom(receiverId: string) {
    // Fetch message history
    return this.apiService.get<IChatRoom>(
      `${this.url}get-or-create-chatroom/${receiverId}`
    );
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
  // getOrCreateChatroom(receiverId: string): Observable<any> {
  //   return this.apiService.post(`${this.url}get-or-create-chatroom/${receiverId}`, {
  //     receiverId,
  //   });
  // }
}
