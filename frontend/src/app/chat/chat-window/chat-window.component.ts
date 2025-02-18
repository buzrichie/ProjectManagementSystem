import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat/chat.service';
import { IChatRoom, IMessage, IProject } from '../../types';
import { AuthService } from '../../services/auth/auth.service';
import { ChatDetailsComponent } from '../chat-details/chat-details.component';
import { SocketIoService } from '../../services/chat/socket-io.service';
import { ParticipantFormComponent } from '../participant-form/participant-form.component';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ChatDetailsComponent,
    ParticipantFormComponent,
    SpinnerComponent,
  ],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css',
})
export class ChatWindowComponent implements OnInit {
  // @Input() project!: IProject;
  // activeChatData!: IChatRoom;
  authService = inject(AuthService);

  @Input() messages: IMessage[] = [];
  @Input() isLoading!: boolean;
  newMessage: string = '';
  isDisplayChatDetails: boolean = false;
  isActivateChatForm: boolean = false;

  @Input() currentChatData!: IChatRoom;
  @Input() isVirtualChatroom: boolean = false;
  @Output() onCloseWindow = new EventEmitter();

  chatForm: FormGroup;

  i: number = 0;
  userId!: string;

  constructor(
    private chatService: ChatService,
    private fb: FormBuilder,
    private socketService: SocketIoService
  ) {
    // Initialize the form
    this.chatForm = this.fb.group({
      content: [''],
    });
  }

  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.userId = data?._id!;
    });
    console.log(this.isLoading);

    // this.chatService.cMessages$.subscribe((chat) => {
    //   if (this.isDisplayChatDetails == true) {
    //     this.isDisplayChatDetails = false;
    //   }
    //   if (!chat) {
    //     return;
    //   }
    //   console.log(chat);

    //   this.ccId = chat.chatRoomId!;

    //   this.messages = chat.messages;
    // });
    this.socketService.onMessage((res: any) => {
      const currentMessages = this.chatService.messagesSubject.value;
      const chatList = this.chatService.chatListSubject.value;
      const index = currentMessages.findIndex(
        (_) => _.chatRoomId === res.chatRoom
      );

      if (index !== -1) {
        // Prevent duplicates by checking if the message already exists
        const messageExists = currentMessages[index].messages.some(
          (msg) => msg._id === res._id || msg.timestamp === res.timestamp
        );

        if (!messageExists) {
          this.messages.push(res);
          currentMessages[index].messages.push(res);
          this.chatService.messagesSubject.next(currentMessages);
        }
      }
      const index1 = chatList.findIndex((_) => _._id === res.chatRoom);

      if (index1 !== -1) {
        chatList[index1].lastMessage = res.content;
        this.chatService.chatListSubject.next(chatList);
      }
    });
  }

  sendMessage() {
    if (this.chatForm.valid) {
      const content = this.chatForm.get('content')?.value;
      if (this.isVirtualChatroom) {
        // console.log(this.currentChatData.participants![0] as string);

        this.chatService
          .createChatRoom(this.currentChatData.participants![0]._id)
          .subscribe((res) => {
            if (!res._id) {
              return;
            }
            this.socketService.sendMessage(res._id, content);
            // console.log('Chatroom Message sent:', content);
          });
      } else {
        this.socketService.sendMessage(this.currentChatData._id!, content);
        // console.log('Message sent:', content);
      }
      this.chatForm.reset(); // Reset form after sending
    }
  }
  onDisplayChatDetail(e: any) {
    this.isDisplayChatDetails = true;
  }
  atvPForm() {
    this.isActivateChatForm = true;
  }
  closePForm() {
    this.isActivateChatForm = false;
  }
  closeDetails() {
    this.isDisplayChatDetails = false;
  }
  closeWindow() {
    this.onCloseWindow.emit(false);
  }
}
