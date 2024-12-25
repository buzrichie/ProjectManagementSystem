import { Component, HostListener, inject } from '@angular/core';
import { ChatService } from '../../services/chat/chat.service';
import { ProjectChatListComponent } from '../project-chat-list/project-chat-list.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { SocketIoService } from '../../services/chat/socket-io.service';
import { IChatRoom } from '../../types';

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
  isLgScreen: boolean = false;

  activeProjectData: IChatRoom | null = null;

  ngOnInit(): void {
    this.chatService.chatLayout$.subscribe((state) => {
      this.isLgScreen = state;
    });
    this.checkScreenSize();
  }

  activateChatWindow(e: IChatRoom) {
    this.actMess(e);
    // this.chatService.currentChat$.subscribe((chat) => {
    //   if (!chat) return; // Ensure a valid project is selected
    // if (this.isDisplayChatDetails == true) {
    //   this.isDisplayChatDetails = false;
    // }
    // Join the project team

    // this.socketService.joinTeam(e._id!);

    // // Fetch message history for the current project
    // this.chatService.getMessage(e._id!).subscribe((res: any) => {
    //   const currentMessages = this.chatService.messagesSubject.value;
    //   console.log(res);

    //   // Update messages for the current project
    //   const chats = { chatRoomId: e._id, messages: res.messages };
    //   this.activeProjectData = chats;
    //   // Check if the project already exists in the array
    //   const index = currentMessages.findIndex(
    //     (item) => item.chatRoomId === e._id
    //   );

    //   if (index !== -1) {
    //     // Replace existing project messages
    //     currentMessages[index] = chats;
    //   } else {
    //     // Add new project messages
    //     currentMessages.push(chats);
    //   }

    // Emit updated messages
    // this.chatService.messagesSubject.getValue().
    // this.chatService.messagesSubject.next([...currentMessages]);
    // });
    // // this.activeChatData = chat!;

    // this.activeProjectData = e;
    // this.activeProject = true;
  }

  actMess(e: IChatRoom) {
    console.log(e);
    // let d = {};
    // if (Object.hasOwn(e, chatRoomId)) {

    // }
    if (this.activeProjectData && this.activeProjectData._id == e._id) {
      return;
    }

    this.socketService.joinTeam(e._id!);
    const messages = this.chatService.messagesSubject.getValue();
    // Check if the project already exists in the array
    const index = messages.findIndex((item) => item.chatRoomId === e._id);
    if (index !== -1) {
      // Replace existing project messages
      // this.activeProjectData.messages.push(messages[index]);
      this.chatService.cMessagesSubject.next(messages[index]);
    } else {
      // Fetch message history for the current project
      this.chatService.getMessage(e._id!).subscribe((res: any) => {
        // Update messages for the current project
        const chats = { chatRoomId: e._id, messages: res.messages };

        this.activeProjectData?.messages.push(res.messages);

        this.chatService.cMessagesSubject.next(chats);
        messages.push(chats);

        // Emit updated messages
        // this.chatService.messagesSubject.getValue().
        // this.chatService.messagesSubject.next([...currentMessages]);
      });
    }
    this.activeProjectData = e;
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
