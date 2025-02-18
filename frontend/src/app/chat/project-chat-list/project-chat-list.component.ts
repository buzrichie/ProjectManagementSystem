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
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-chat-list',
  standalone: true,
  imports: [ReactiveFormsModule],
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

  filteredchatList: IChatRoom[] = [];
  searchControl: FormControl = new FormControl('');

  filterCriteria: string = 'all';

  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.userId = data?._id!;
    });
    this.filterData();
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
  // Set filter criteria (group, one-to-one, or all)
  setFilter(filter: string) {
    this.filterCriteria = filter;
    this.filterData(); // Reapply the filter when the filter changes
  }

  filterData() {
    this.filteredchatList =
      this.chatList.filter((chat) => {
        // Safe check for chat.name, ensuring it isn't undefined or null
        const matchesSearchTerm =
          chat.name
            ?.toLowerCase()
            .includes(this.searchControl.value.toLowerCase()) || false;

        // Check if the chat type matches the selected filter
        const matchesChatType =
          this.filterCriteria === 'all' || chat.type === this.filterCriteria;

        // Check if the chat has participants
        let matchesParticipants = false;
        if (chat.participants && chat.participants.length > 0) {
          for (let i of chat.participants) {
            if (i !== undefined && i._id !== this.userId) {
              // Check if participant matches the search term
              if (
                i.username
                  .toLowerCase()
                  .includes(this.searchControl.value.toLowerCase())
              ) {
                matchesParticipants = true;
              }
            }
          }
        } else {
          // If no participants, check if the chat name matches the search term
          matchesParticipants = matchesSearchTerm;
        }

        // Final filter logic combining the search term, chat type, and participants
        return matchesParticipants && matchesChatType;
      }) || this.chatList;
  }

  // }
}
