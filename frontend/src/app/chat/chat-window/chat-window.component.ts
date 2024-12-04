import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat/chat.service';
import { IProject } from '../../types';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css',
})
export class ChatWindowComponent implements OnInit {
  // @Input() project!: IProject;
  project!: IProject;

  messages: any[] = [];
  newMessage: string = '';

  chatForm: FormGroup;

  constructor(private chatService: ChatService, private fb: FormBuilder) {
    // Initialize the form
    this.chatForm = this.fb.group({
      message: [''],
    });
  }

  ngOnInit(): void {
    this.chatService.currentProject$.subscribe((project) => {
      if (!project) return; // Ensure a valid project is selected

      // Join the project team
      this.chatService.joinTeam(project._id!);

      // Fetch message history for the current project
      this.chatService.getMessage(project._id!).subscribe((messages) => {
        const currentMessages = this.chatService.messagesSubject.value;

        // Update messages for the current project
        const projectMessages = { projectId: project._id, messages };

        // Check if the project already exists in the array
        const index = currentMessages.findIndex(
          (item) => item.projectId === project._id
        );

        if (index !== -1) {
          // Replace existing project messages
          currentMessages[index] = projectMessages;
        } else {
          // Add new project messages
          currentMessages.push(projectMessages);
        }
        // Emit updated messages
        this.chatService.messagesSubject.next([...currentMessages]);
      });

      this.project = project!;
    });

    this.chatService.messages$.subscribe((messages) => {
      if (messages.length < 1) return;
      this.messages = messages.find(
        (_) => _.projectId === this.project._id
      )?.messages;
    });

    // Listen for incoming messages
    this.chatService.onMessage((message) => {
      console.log('new message');
      console.log(message);

      const currentMessages = this.chatService.messagesSubject.value;
      console.log(currentMessages);
      const index = currentMessages.findIndex(
        (_) => _.projectId === message.teamId
      );
      if (index === -1) {
        return;
      }
      currentMessages[index].messages.push(message);
      console.log(currentMessages);

      this.chatService.messagesSubject.next(currentMessages);
    });
  }

  sendMessage() {
    if (this.chatForm.valid) {
      const message = this.chatForm.get('message')?.value;
      this.chatService.sendMessage(this.project._id, message);
      console.log('Message sent:', message);
      this.chatForm.reset(); // Reset form after sending
    }
  }
}
