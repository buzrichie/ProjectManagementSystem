import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { TeamService } from '../../../services/api/team.service';
import { AuthService } from '../../../services/auth/auth.service';
import { IGroup } from '../../../types';
import { BtnAddComponent } from '../../btn-add/btn-add.component';
import { BtnAssignProjectOrTeamComponent } from '../../components/btn-assign-project-or-team/btn-assign-project-or-team.component';
import { AssignProjectFormComponent } from '../../forms/assign-project-form/assign-project-form.component';
import { MemberFormComponent } from '../../members/member-form/member-form.component';

@Component({
  selector: 'app-group-detials',
  standalone: true,
  imports: [
    BtnAddComponent,
    BtnAssignProjectOrTeamComponent,
    AssignProjectFormComponent,
    MemberFormComponent,
    RouterLink,
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
  team!: IGroup;

  isEnableAssginForm: boolean = false;
  isEditMode: boolean = false;
  isAddMode: boolean = false;
  isEnableAddUserForm: boolean = false;

  ngOnInit(): void {
    this.routeId = this.route.snapshot.params['id'];
    if (this.teamService.teamListSubject.getValue().length < 1) {
      // this.authService.authUser$.subscribe({
      //   next: (user) => {
      this.teamService.getOne<IGroup>(`${this.routeId}`).subscribe({
        next: (data: IGroup) => {
          this.team = data;
        },
      });
      //   },
      // });
    } else {
      this.teamService.teamList$.subscribe((teams: IGroup[]) => {
        this.team = teams.find((team) => team._id === this.routeId)!;
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
}
