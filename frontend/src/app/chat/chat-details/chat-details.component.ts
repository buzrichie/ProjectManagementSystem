import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { IChatRoom } from '../../types';

@Component({
  selector: 'app-chat-details',
  standalone: true,
  imports: [],
  templateUrl: './chat-details.component.html',
  styleUrl: './chat-details.component.css',
})
export class ChatDetailsComponent {
  @Output() onCloseDetails = new EventEmitter();
  @Output() onActivatePForm = new EventEmitter();
  authService = inject(AuthService);
  @Input() currentChatData!: IChatRoom;

  closeWindow() {
    this.onCloseDetails.emit();
  }
  removeParticipant(e: any) {}
  addParticipant() {
    this.onActivatePForm.emit();
  }
  clearChatHistory() {}
}
