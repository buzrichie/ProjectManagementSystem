import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
// import { ApiService } from '../../../../services/api/api.service';
import { ApiService } from '../../../services/api/api.service';
import { INotification, IUser } from '../../../types';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { SidebarService } from '../../../services/utils/sidebar-toggle.service';
import { SpinnerService } from '../../../services/utils/spinner.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../../services/utils/theme.service';
import { NotificationService } from '../../../services/utils/notification.service';

@Component({
  selector: 'app-dnavbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dnavbar.component.html',
  styleUrl: './dnavbar.component.css',
})
export class DnavbarComponent implements OnInit {
  authService = inject(AuthService);
  apiService = inject(ApiService);
  sidebarService = inject(SidebarService);
  themeService = inject(ThemeService);
  spinnerS = inject(SpinnerService);
  platformId = inject(PLATFORM_ID);
  notificationService = inject(NotificationService);
  isOpen!: boolean;
  user!: IUser | null;
  sideBar: boolean = false;
  messageCount!: number;
  isSignOutDialouge: boolean = false;
  isNotificationBox: boolean = false;
  notificationList: INotification[] = [];
  ngOnInit() {
    this.spinnerS.skip();
    this.notificationService.getNotifications().subscribe((notification) => {
      this.notificationList = notification;
    });
    // if (isPlatformBrowser(this.platformId)) {
    //   this.apiService
    //     .get<[]>('/api/inquiry/')
    //     .subscribe({
    //       next: (res) => {
    //         this.spinnerS.reset();
    //         this.messageCount = res.length;
    //       },
    //       error: () => {
    //         this.spinnerS.reset();
    //       },
    //     });
    // }
    this.authService.authUser$.subscribe((data) => {
      this.user = data;
    });
    this.sidebarService.sidebarState$.subscribe((val: boolean) => {
      this.isOpen = val;
    });
  }
  logOut() {
    this.authService.logOut();
  }
  makeRead() {
    this.messageCount = 0;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
  toggleNotiDropdown() {
    this.isNotificationBox = !this.isNotificationBox;
  }
  toggleDropdown() {
    this.isSignOutDialouge = !this.isSignOutDialouge;
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }
  hideSideBar() {
    this.sidebarService.hideSidebar();
  }
}
