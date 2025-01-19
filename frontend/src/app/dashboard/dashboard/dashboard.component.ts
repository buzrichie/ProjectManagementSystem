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
  constructor(private apiService: ApiService, private router: Router) {}
  user!: IUser;
  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.user = data!;
    });
  }

  postRequestForm(e: any) {
    this.isAddMode = true;
    this.isEnableCreateTeamForm = true;
  }

  handlePostRequest(formValue: any) {
    this.teamService.post(formValue).subscribe({
      next: (data) => {
        this.teamService.teamListSubject.subscribe((oldData) => {
          oldData.push(data);
        });
        this.toast.success('Sussessfully added Team');
      },
      error: (error) => this.toast.danger(`Failed to edit Team ${error.error}`),
    });
  }
  closeTeamForm(e: any) {
    this.isEnableCreateTeamForm = false;
  }
}
