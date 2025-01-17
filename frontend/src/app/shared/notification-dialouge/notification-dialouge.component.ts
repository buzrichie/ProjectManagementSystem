import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { SocketIoService } from '../../services/chat/socket-io.service';
import { NotificationService } from '../../services/utils/notification.service';

@Component({
  selector: 'app-notification-dialouge',
  standalone: true,
  imports: [],
  templateUrl: './notification-dialouge.component.html',
  styleUrl: './notification-dialouge.component.css',
})
export class NotificationDialougeComponent implements OnInit {
  socketService = inject(SocketIoService);
  notificationService = inject(NotificationService);

  notification: any | null = null;

  @Output() onCloseNotification = new EventEmitter();

  ngOnInit(): void {
    this.socketService.onNotification();
    this.notificationService.newNotification$.subscribe((notification) => {
      this.notification = notification;
    });
  }
  closeNotification() {
    this.notification = null;
  }
}
