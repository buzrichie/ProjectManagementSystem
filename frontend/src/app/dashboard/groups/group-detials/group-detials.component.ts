import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { TeamService } from '../../../services/api/team.service';
import { AuthService } from '../../../services/auth/auth.service';
import { IGroup } from '../../../types';
import { BtnAddComponent } from '../../btn-add/btn-add.component';
import { BtnAssignProjectOrTeamComponent } from '../../components/btn-assign-project-or-team/btn-assign-project-or-team.component';
import { AssignProjectFormComponent } from '../../forms/assign-project-form/assign-project-form.component';
import { MemberFormComponent } from '../../members/member-form/member-form.component';
import { ToastService } from '../../../services/utils/toast.service';

@Component({
  selector: 'app-group-detials',
  standalone: true,
  imports: [
    BtnAddComponent,
    BtnAssignProjectOrTeamComponent,
    AssignProjectFormComponent,
    MemberFormComponent,
    RouterLink,
    RouterOutlet,
  ],
  templateUrl: './group-detials.component.html',
  styleUrl: './group-detials.component.css',
})
export class GroupDetialsComponent implements OnInit {
  backendUrl = environment.backendUrl;
  route = inject(ActivatedRoute);
  teamService = inject(TeamService);
  authService = inject(AuthService);

  routeId: string = '';
  group!: IGroup;

  isEnableAssginForm: boolean = false;
  isEditMode: boolean = false;
  isAddMode: boolean = false;
  isEnableAddUserForm: boolean = false;
  userRole: string | undefined;
  toast = inject(ToastService);

  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.userRole = data?.role;
    });
    this.route.params.subscribe((params) => {
      this.fetchData(params['id']);
    });
  }
  fetchData(routeId: any) {
    if (this.teamService.teamListSubject.getValue().length < 1) {
      this.teamService.getOne<IGroup>(`${routeId}`).subscribe({
        next: (data: IGroup) => {
          this.group = data;
        },
      });
    } else {
      this.teamService.teamList$.subscribe((teams: IGroup[]) => {
        this.group = teams.find((team) => team._id === routeId)!;
      });
    }
  }

  activateAssignForm(e: any) {
    if (e === true) {
      this.isEnableAssginForm = e;
    } else {
      this.isEnableAssginForm = e;
    }
  }
  onActivateForm(e: any) {
    console.log(e);
    if (e === true) {
      this.isEnableAddUserForm = e;
    } else {
      this.isEnableAddUserForm = e;
    }
  }
  deleteData(e: any) {
    this.teamService.delete(e._id).subscribe({
      next: (res: any) => {
        this.teamService.teamListSubject.subscribe((data) => {
          data.splice(e.index, 1);
        });
        this.toast.success(res.message);
      },
      error: (error) =>
        this.toast.danger(`Failed to delete service. ${error.error}`),
    });
  }
}
