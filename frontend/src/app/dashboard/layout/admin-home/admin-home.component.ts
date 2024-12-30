import { Component, Inject, OnInit, inject } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { DnavbarComponent } from '../dnavbar/dnavbar.component';
// import { TableComponent } from '../../users/table/table.component';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
// import { UserComponent } from '../../users/user/user.component';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { ApiService } from '../../../services/api/api.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ToasterComponent } from '../../../shared/toaster/toaster.component';
import { ToastService } from '../../../services/utils/toast.service';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { NotificationDialougeComponent } from '../../../shared/notification-dialouge/notification-dialouge.component';
import { NotificationService } from '../../../services/utils/notification.service';
// import { ShowUnshowFormService } from '../../../../services/show-unshow-form.service';
// import { SwService } from '../../../../services/sw-services/sw-service.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    DnavbarComponent,
    // TableComponent,
    // UserComponent,
    // DashboardComponent,
    ToasterComponent,
    NotificationDialougeComponent,
    // SpinnerComponent,
  ],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css',
})
export class AdminHomeComponent implements OnInit {
  private url = `/api/user/`;
  // bs = inject(BrowserStorageService)
  apiService = inject(ApiService);
  authService = inject(AuthService);
  toast = inject(ToastService);
  router = inject(Router);
  notificationService = inject(NotificationService);
  notification!: any;
  isNotification = false;
  // showFormService = inject(ShowUnshowFormService);

  // constructor(private swService: SwService) {}
  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // if (this.showFormService.showFormSubject.getValue()) {
        //   this.showFormService.disable();
        // }
        if (this.toast.isActiveToastSubject.getValue()) {
          this.toast.reset();
        }
      }
    });
    // this.notificationService.newNotification$.subscribe((notification) => {
    //   console.log(notification);
    //   this.notification = notification;

    //   this.isNotification = true;
    // });
  }

  // Notifi_() {
  //   this.isNotification = true;
  // }
  // closeNotifi_() {
  //   this.isNotification = false;
  // }

  // fetch() {}
}
