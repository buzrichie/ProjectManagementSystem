import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { TeamService } from '../../../services/api/team.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ShowUnshowFormService } from '../../../services/utils/show-unshow-form.service';
import { ToastService } from '../../../services/utils/toast.service';
import { IGroup, IUser } from '../../../types';
import { BtnAddComponent } from '../../btn-add/btn-add.component';
import { BtnAssignProjectOrTeamComponent } from '../../components/btn-assign-project-or-team/btn-assign-project-or-team.component';
import { AssignProjectFormComponent } from '../../forms/assign-project-form/assign-project-form.component';
import { GroupFormComponent } from '../group-form/group-form.component';
import { GroupListComponent } from '../group-list/group-list.component';
import { GroupDetialsComponent } from '../group-detials/group-detials.component';
import { BtnUnshowformComponent } from '../../../shared/btn-unshowform/btn-unshowform.component';
import { BtnTableEditComponent } from '../../../shared/btn-table-edit/btn-table-edit.component';
import { BtnTableDeleteComponent } from '../../../shared/btn-table-delete/btn-table-delete.component';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [
    GroupFormComponent,
    RouterOutlet,
    BtnAddComponent,
    AssignProjectFormComponent,
    BtnAssignProjectOrTeamComponent,
    GroupListComponent,
    // GroupDetialsComponent,
    // BtnUnshowformComponent,
    // BtnTableEditComponent,
    // BtnTableDeleteComponent,
    // RouterLink,
  ],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css',
})
export class GroupComponent implements OnInit {
  private url = `/api/group/`;

  toast = inject(ToastService);
  showFormService = inject(ShowUnshowFormService);
  authService = inject(AuthService);
  teamService = inject(TeamService);
  private activatedRoute = inject(ActivatedRoute);
  routeId!: string;

  team!: IGroup;
  isData: boolean = false;
  isEnableCreateTeamForm: boolean = false;
  isEditMode: boolean = false;
  isAddMode: boolean = false;
  selectedDataIndex!: number;
  groupListData: IGroup[] = [];
  userRole!: IUser['role'];

  isEnableAssginForm: boolean = false;
  islistSelected: any;
  isLgScreen: any;
  islistSelectedData!: { data: IGroup; index: number };

  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.userRole = data?.role;
    });
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
      this.groupListData = this.teamService.teamListSubject.value;
      this.isData = true;
    } else {
      this.routeId = this.activatedRoute.parent?.snapshot.params['id'];
      if (!this.routeId) {
        this.teamService.get<IGroup>().subscribe({
          next: (res: any) => {
            this.groupListData = res.data;
            this.teamService.teamListSubject.next(res.data);
            this.isData = true;
          },
          error: (error) =>
            this.toast.danger(`Error in getting Teams. ${error.error}`),
        });
      } else {
        this.teamService.getProjectTeams<IGroup>(this.routeId).subscribe({
          next: (res: any) => {
            this.groupListData = res.data;
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
        this.groupListData.push(data);
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
            (Team: IGroup) => Team._id == this.team._id
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
  selectedGroup(e: { data: IGroup; index: number }) {
    console.log(e);
    this.islistSelectedData = e;
    // this.teamService.cprojectSubject.next(e.data);
    this.islistSelected = true;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
    console.log(this.islistSelected);
    console.log(this.isLgScreen);
  }

  checkScreenSize() {
    this.isLgScreen = window.innerWidth >= 587;
  }
  closeForm() {
    this.islistSelected = false;
  }

  closeTeamForm(e: any) {
    this.isEnableCreateTeamForm = false;
  }
}
