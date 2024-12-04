import { Component, inject, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat/chat.service';
import { ApiService } from '../../services/api/api.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProjectChatListComponent } from '../project-chat-list/project-chat-list.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { IProject } from '../../types';

@Component({
  selector: 'app-team-chat',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProjectChatListComponent,
    ChatWindowComponent,
  ],
  templateUrl: './team-chat.component.html',
  styleUrl: './team-chat.component.css',
})
export class TeamChatComponent implements OnInit {
  protected activeProject!: boolean;

  chatService = inject(ChatService);

  ngOnInit(): void {}

  activateChatWindow(e: any) {
    this.activeProject = true;
  }
}
