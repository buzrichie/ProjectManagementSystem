import { Component, HostListener, inject } from '@angular/core';
import { ChatService } from '../../services/chat/chat.service';
import { ProjectChatListComponent } from '../project-chat-list/project-chat-list.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { SocketIoService } from '../../services/chat/socket-io.service';
import { IChatRoom, IMessage, IUser } from '../../types';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [ProjectChatListComponent, ChatWindowComponent],
  templateUrl: './chat-layout.component.html',
  styleUrl: './chat-layout.component.css',
})
export class ChatLayoutComponent {
  protected activeProject: boolean = false;

  chatService = inject(ChatService);
  socketService = inject(SocketIoService);
  route = inject(ActivatedRoute);
  chatRoomList: IChatRoom[] = [];
  isLgScreen: boolean = false;
  receiverId: IUser['_id'] | null = null; // Receiver's user ID
  activeChatRoomData: IChatRoom | null = null; // The active chatroom
  isVirtualChatroom: boolean = false; // Track if the chatroom is virtual
  roomMessages: IMessage[] = [];

  i: number = 0;
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.receiverId = params['receiverId'];
      if (this.receiverId) {
        this.initializeChatroom();
      }
    });
    this.initializeChat();
    this.checkScreenSize();
  }

  // Fetch existing chatrooms if needed
  initializeChat() {
    if (this.chatService.chatListSubject.getValue().length < 1) {
      this.chatService.getChatRooms<IChatRoom>().subscribe({
        next: (res: any) => {
          console.log(res);
          let value = res.chatRooms;
          this.chatRoomList = value;
          this.chatService.chatListSubject.next(value);
        },
      });
    } else {
      this.chatRoomList = this.chatService.chatListSubject.value;
    }
  }

  // Handle virtual or existing chatroom initialization
  initializeChatroom() {
    this.chatService.getOrCreateChatroom(this.receiverId!).subscribe({
      next: (res: any) => {
        console.log(res);

        if (res._id) {
          // Use existing chatroom
          this.activeChatRoomData = res;
          this.isVirtualChatroom = false; // It's a persistent chatroom
          this.activateChatWindow(res);
          // this.getRoomMessages(res);
        } else {
          // Enter virtual mode
          this.isVirtualChatroom = true;
          this.activeChatRoomData = {
            _id: '',
            participants: [this.receiverId!],
            lastMessage: '',
            type: 'one-to-one',
            messages: [],
          };
          this.chatService.cMessagesSubject.next(null);
          this.activateChatWindow(this.activeChatRoomData);
        }
        this.activeProject = true;
      },
      error: (error) => {
        console.error('Error fetching or creating chatroom:', error);
      },
    });
  }

  // Activate the chat window
  activateChatWindow(chatRoom: IChatRoom) {
    if (
      this.activeChatRoomData &&
      this.activeChatRoomData._id === chatRoom._id
    ) {
      return;
    }
    this.activeChatRoomData = chatRoom;
    this.getRoomMessages(chatRoom);
  }

  getRoomMessages(e: IChatRoom) {
    // Join the conversation room
    if (e._id) {
      this.socketService.joinConversation(e._id!);
    }

    const messages = this.chatService.messagesSubject.value;

    // Check if the roomMessage already exists in the array
    const index = messages.findIndex((item) => item.chatRoomId === e._id);

    if (index !== -1) {
      // Use existing roomMessage messages
      this.roomMessages = messages[index].messages;
      this.chatService.cMessagesSubject.next(messages[index]);
    } else {
      // Fetch message history for the current roomMessage
      this.chatService.getMessage(e._id!).subscribe((res: any) => {
        const chats = { chatRoomId: e._id, messages: res };
        this.roomMessages = res;
        // Check if the messages are the same (prevent duplicates)
        const existingMessages = this.chatService.messagesSubject.value.filter(
          (chat) => chat.chatRoomId === e._id
        );
        const combinedMessages = existingMessages.length
          ? [...existingMessages[0].messages, ...res]
          : res;

        // Filter out duplicates by comparing the unique message ID (e.g., `timestamp` or `messageId`)
        const uniqueMessages = Array.from(
          new Set(combinedMessages.map((message: any) => message.timestamp)) // Assuming `timestamp` is unique
        ).map((timestamp) =>
          combinedMessages.find(
            (message: any) => message.timestamp === timestamp
          )
        );

        this.chatService.cMessagesSubject.next({
          chatRoomId: e._id,
          messages: uniqueMessages,
        });

        // Update the main messages subject with unique messages
        this.chatService.messagesSubject.next([
          ...messages.filter((chat) => chat.chatRoomId !== e._id),
          { chatRoomId: e._id, messages: uniqueMessages },
        ]);
      });
    }

    this.activeProject = true;
  }

  closeChatWindow() {
    this.activeProject = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isLgScreen = window.innerWidth >= 587;
  }
}
