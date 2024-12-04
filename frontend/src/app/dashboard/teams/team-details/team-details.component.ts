import { Component, Input, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ITeam } from '../../../types';
// import { MakeActiveComponent } from '../../make-active/make-active.component';
import { environment } from '../../../../environments/environment';
import { TeamService } from '../../../services/api/team.service';
import { AuthService } from '../../../services/auth/auth.service';
import { BtnAssignProjectOrTeamComponent } from '../../components/btn-assign-project-or-team/btn-assign-project-or-team.component';
import { AssignProjectFormComponent } from '../../forms/assign-project-form/assign-project-form.component';

@Component({
  selector: 'app-team-details',
  standalone: true,
  imports: [
    // MakeActiveComponent,
    BtnAssignProjectOrTeamComponent,
    AssignProjectFormComponent,
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
  team!: ITeam;

  isEnableAssginForm: boolean = false;

  ngOnInit(): void {
    this.routeId = this.route.snapshot.params['id'];
    if (this.teamService.teamListSubject.getValue().length < 1) {
      // this.authService.authUser$.subscribe({
      //   next: (user) => {
      this.teamService.getOne<ITeam>(`${this.routeId}`).subscribe({
        next: (data: ITeam) => {
          this.team = data;
        },
      });
      //   },
      // });
    } else {
      this.teamService.teamList$.subscribe((teams: ITeam[]) => {
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
}
