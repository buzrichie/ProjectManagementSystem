import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ProjectService } from '../../services/api/project.service';
import { IChatRoom } from '../../types';
import { ToastService } from '../../services/utils/toast.service';
import { ChatService } from '../../services/chat/chat.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-project-chat-list',
  standalone: true,
  imports: [],
  templateUrl: './project-chat-list.component.html',
  styleUrl: './project-chat-list.component.css',
})
export class ProjectChatListComponent implements OnInit {
  private chatService = inject(ChatService);
  // protected currentProject: boolean = false;
  private toast = inject(ToastService);
  authService = inject(AuthService);
  userId!: string;
  @Input() chatList: IChatRoom[] = [];

  @Output() onActivateChat = new EventEmitter();

  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.userId = data?._id!;
    });
    // this.fetch();
    // this.chatService.chatList$.subscribe(
    //   (data: IChatRoom[]) => (this.chatList = data)
    // );
  }

  // fetch() {
  //   if (this.chatService.chatListSubject.getValue().length < 1) {
  //     this.chatService.getChatRooms<IChatRoom>().subscribe({
  //       next: (res: any) => {
  //         console.log(res);
  //         let value = res.chatRooms;
  //         this.chatService.chatListSubject.next(value);
  //       },
  //       error: (error) =>
  //         this.toast.danger(`Error in getting projects. ${error.error}`),
  //     });
  //   }
  // }
  enableProject(e: IChatRoom) {
    this.onActivateChat.emit(e);
    this.chatService.currentChatSubject.next(e);
  }
}
