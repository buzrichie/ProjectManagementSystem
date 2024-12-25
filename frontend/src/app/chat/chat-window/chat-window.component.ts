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

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ChatDetailsComponent,
    ParticipantFormComponent,
  ],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css',
})
export class ChatWindowComponent implements OnInit {
  // @Input() project!: IProject;
  // activeChatData!: IChatRoom;
  authService = inject(AuthService);

  messages: IMessage[] = [];
  newMessage: string = '';
  isDisplayChatDetails: boolean = false;
  isActivateChatForm: boolean = false;

  @Input() currentChatData!: IChatRoom;
  @Output() onCloseWindow = new EventEmitter();

  ccId!: string;

  chatForm: FormGroup;

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
    this.chatService.cMessages$.subscribe((chat) => {
      if (this.isDisplayChatDetails == true) {
        this.isDisplayChatDetails = false;
      }
      if (!chat) {
        return;
      }
      this.ccId = chat.chatRoomId!;

      this.messages = chat.messages;
    });
    // this.chatService.currentChat$.subscribe((chat) => {
    //   if (!chat) return; // Ensure a valid project is selected
    //   if (this.isDisplayChatDetails == true) {
    //     this.isDisplayChatDetails = false;
    //   }
    //   // Join the project team
    //   this.socketService.joinTeam(chat._id!);

    //   // Fetch message history for the current project
    //   this.chatService.getMessage(chat._id!).subscribe((res: any) => {
    //     const currentMessages = this.chatService.messagesSubject.value;
    //     console.log(res);

    //     // Update messages for the current project
    //     const chats = { chatRoomId: chat._id, messages: res.messages };

    //     // Check if the project already exists in the array
    //     const index = currentMessages.findIndex(
    //       (item) => item.chatRoomId === chat._id
    //     );

    //     if (index !== -1) {
    //       // Replace existing project messages
    //       currentMessages[index] = chats;
    //     } else {
    //       // Add new project messages
    //       currentMessages.push(chats);
    //     }
    //     // Emit updated messages
    //     this.chatService.messagesSubject.next([...currentMessages]);
    //   });
    //   this.activeChatData = chat!;
    // });
    // console.log(this.authService.authUserSubject.getValue()?._id);

    // this.chatService.cMessagesSubject.subscribe((data) => {
    //   //close chat detail on init
    //   if (this.isDisplayChatDetails == true) {
    //     this.isDisplayChatDetails = false;
    //   }
    //   // if (data.length < 1) return;
    //   // this.messages = messages.find(
    //   //   (_) => _.chatRoomId === this.currentChatData._id
    //   // )?.messages;
    //   this.messages= data?.messages
    // });

    // console.log(this.currentChatData.messages);
    // this.messages = this.currentChatData.messages;

    // Listen for incoming messages
    this.socketService.onMessage((res) => {
      console.log('new message');
      console.log(res);

      const currentMessages = this.chatService.messagesSubject.value;
      console.log(currentMessages);
      const index = currentMessages.findIndex(
        (_) => _.chatRoomId === res.newMessage.recipient
      );
      // if (index === -1) {
      //   return;
      // }
      currentMessages[index].messages.push(res.newMessage);
      console.log(currentMessages);

      this.chatService.messagesSubject.next(currentMessages);
    });
  }

  sendMessage() {
    if (this.chatForm.valid) {
      const content = this.chatForm.get('content')?.value;
      this.socketService.sendMessage(this.ccId, content);
      console.log('Message sent:', content);
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
    this.isActivateChatForm = true;
  }
  closeDetails() {
    this.isDisplayChatDetails = false;
  }
  closeWindow() {
    this.onCloseWindow.emit(false);
  }
}
