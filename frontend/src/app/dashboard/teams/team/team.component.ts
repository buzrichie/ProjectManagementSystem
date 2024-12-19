import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { TeamFormComponent } from '../team-form/team-form.component';
import { TeamTableComponent } from '../team-table/team-table.component';
import { ITeam } from '../../../types';
import { ToastService } from '../../../services/utils/toast.service';
import { ShowUnshowFormService } from '../../../services/utils/show-unshow-form.service';
import { BtnAddComponent } from '../../btn-add/btn-add.component';
import { AuthService } from '../../../services/auth/auth.service';
import { TeamService } from '../../../services/api/team.service';
import { BtnAssignProjectOrTeamComponent } from '../../components/btn-assign-project-or-team/btn-assign-project-or-team.component';
import { AssignProjectFormComponent } from '../../forms/assign-project-form/assign-project-form.component';

@Component({
  selector: 'app-Team',
  standalone: true,
  imports: [
    TeamFormComponent,
    TeamTableComponent,
    RouterOutlet,
    BtnAddComponent,
    AssignProjectFormComponent,
    BtnAssignProjectOrTeamComponent,
    // TeamDetailsComponent,
  ],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css',
})
export class TeamComponent implements OnInit {
  private url = `/api/Team/`;

  toast = inject(ToastService);
  showFormService = inject(ShowUnshowFormService);
  authService = inject(AuthService);
  teamService = inject(TeamService);
  private activatedRoute = inject(ActivatedRoute);
  routeId!: string;

  team!: ITeam;
  isData: boolean = false;
  isEnableCreateTeamForm: boolean = false;
  isEditMode: boolean = false;
  isAddMode: boolean = false;
  selectedDataIndex!: number;

  isEnableAssginForm: boolean = false;

  ngOnInit(): void {
    this.fetch();
    this.showFormService.showForm$.subscribe((res) => {
      this.isEnableCreateTeamForm = res;
    });
  }

  putRequestForm(selected: any) {
    this.isEditMode = true;
    this.isAddMode = false;
    this.team = selected.Team;
    this.selectedDataIndex = selected.index;
  }

  postRequestForm(e: any) {
    this.isAddMode = true;
    this.isEditMode = false;
    this.isEnableCreateTeamForm = true;
    // this.Team = {
    //   name: '',
    //   description: '',
    //   type: '',
    //   image: '',
    //   toolsInvolved: '',
    //   status: '',
    // };
  }
  activateAssignForm(e: any) {
    if (e === true) {
      this.isEnableAssginForm = e;
    } else {
      this.isEnableAssginForm = e;
    }
  }

  fetch() {
    if (this.teamService.teamListSubject.getValue().length > 0) {
      this.isData = true;
    } else {
      this.routeId = this.activatedRoute.parent?.snapshot.params['id'];
      if (!this.routeId) {
        this.teamService.get<ITeam>().subscribe({
          next: (res: any) => {
            this.teamService.teamListSubject.next(res.data);
            this.isData = true;
          },
          error: (error) =>
            this.toast.danger(`Error in getting Teams. ${error.error}`),
        });
      } else {
        this.teamService.getProjectTeams<ITeam>(this.routeId).subscribe({
          next: (res: any) => {
            this.teamService.teamListSubject.next(res.data);
            this.isData = true;
          },
          error: (error) =>
            this.toast.danger(`Error in getting Teams. ${error.error}`),
        });
      }
    }
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

  handlePutRequest(formValue: any) {
    this.teamService.put(this.team._id!, formValue).subscribe({
      next: (data: any) => {
        // find the availabe Team and update the datails when the edit is successful
        // will update it to use index
        this.teamService.teamListSubject.subscribe((Teams) => {
          let index = Teams.findIndex(
            (Team: ITeam) => Team._id == this.team._id
          );
          Teams[index] = data;
        });
        this.toast.success('Sussessfully edited Team');
      },
      error: (error) => {
        this.toast.danger(`Failed to edit Team ${error.error}`);
      },
    });
  }

  deleteData(e: any) {
    this.teamService.delete(e.id).subscribe({
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

  closeTeamForm(e: any) {
    this.isEnableCreateTeamForm = false;
  }
}
