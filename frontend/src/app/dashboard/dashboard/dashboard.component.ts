import { Component, OnInit, afterNextRender, inject } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Router, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { IUser } from '../../types';
import { BtnAddComponent } from '../btn-add/btn-add.component';
import { GroupFormComponent } from '../groups/group-form/group-form.component';
import { TeamService } from '../../services/api/team.service';
import { ToastService } from '../../services/utils/toast.service';
import { DashboardService } from '../../services/api/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BtnAddComponent, GroupFormComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  isEnableCreateTeamForm: boolean = false;
  isAddMode: boolean = false;
  teamService = inject(TeamService);
  toast = inject(ToastService);
  dashboardData: any;
  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}
  user!: IUser;
  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.user = data!;
    });
    this.getDashboardDate();
  }

  getDashboardDate() {
    if (this.dashboardService.dashboardDataSubject.getValue()) {
      this.dashboardData = this.dashboardService.dashboardDataSubject.value;
      // this.isData = true;
    } else {
      this.dashboardService.get().subscribe({
        next: (data) => {
          this.dashboardService.dashboardDataSubject.next(data);
          this.dashboardData = data;
        },
        error: (error) =>
          this.toast.danger(`Failed to get dashboard Data ${error.message}`),
      });
    }
  }

  postRequestForm(e: any) {
    this.isAddMode = true;
    this.isEnableCreateTeamForm = true;
  }

  handlePostRequest(formValue: any) {
    this.teamService.post(formValue).subscribe({
      next: (data) => {
        // this.teamService.teamListSubject.subscribe((oldData) => {
        //   oldData.push(data);
        // });
        if (this.user.role == 'student') {
          const authUserData = this.authService.authUserSubject.value;
          if (typeof authUserData?.group == 'object') {
            authUserData.group._id = data._id;
          } else {
            authUserData!.group = data._id;
          }

          this.authService.authUserSubject.next(authUserData);
        }
        this.toast.success('Sussessfully added Team');
      },
      error: (error) =>
        this.toast.danger(`Failed to edit Team ${error.message}`),
    });
  }
  closeTeamForm(e: any) {
    this.isEnableCreateTeamForm = false;
  }
}
