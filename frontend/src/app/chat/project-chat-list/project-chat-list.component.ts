import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { ProjectService } from '../../services/api/project.service';
import { IProject } from '../../types';
import { ToastService } from '../../services/utils/toast.service';
import { ChatService } from '../../services/chat/chat.service';

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
  projects: IProject[] = [];

  @Output() onActivateChat = new EventEmitter();

  ngOnInit(): void {
    this.fetch();
    this.chatService.chatList$.subscribe(
      (data: IProject[]) => (this.projects = data)
    );
  }

  fetch() {
    if (this.chatService.chatListSubject.getValue().length < 1) {
      this.chatService.getChatRooms<IProject>().subscribe({
        next: (res: any) => {
          console.log(res);
          let value = res.chatRooms;
          this.chatService.chatListSubject.next(value);
        },
        error: (error) =>
          this.toast.danger(`Error in getting projects. ${error.error}`),
      });
    }
  }
  enableProject(e: any) {
    this.onActivateChat.emit(e);
    this.chatService.currentChatSubject.next(e);
  }
}
