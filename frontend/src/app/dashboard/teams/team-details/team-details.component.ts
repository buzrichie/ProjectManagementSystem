import { Component, Input, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IGroup } from '../../../types';
// import { MakeActiveComponent } from '../../make-active/make-active.component';
import { environment } from '../../../../environments/environment';
import { TeamService } from '../../../services/api/team.service';
import { AuthService } from '../../../services/auth/auth.service';
import { BtnAssignProjectOrTeamComponent } from '../../components/btn-assign-project-or-team/btn-assign-project-or-team.component';
import { AssignProjectFormComponent } from '../../forms/assign-project-form/assign-project-form.component';
import { BtnAddComponent } from '../../btn-add/btn-add.component';
import { MemberFormComponent } from '../../members/member-form/member-form.component';

@Component({
  selector: 'app-team-details',
  standalone: true,
  imports: [
    // MakeActiveComponent,
    BtnAssignProjectOrTeamComponent,
    AssignProjectFormComponent,
    RouterLink,
    BtnAddComponent,
    MemberFormComponent,
  ],
  templateUrl: './team-details.component.html',
  styleUrl: './team-details.component.css',
})
export class TeamDetailsComponent implements OnInit {
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
