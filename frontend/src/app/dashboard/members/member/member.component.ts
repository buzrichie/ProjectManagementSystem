import { Component, inject, Input, OnInit } from '@angular/core';
import { MemberListComponent } from '../member-list/member-list.component';
import { BtnAddComponent } from '../../btn-add/btn-add.component';
import { ToastService } from '../../../services/utils/toast.service';
import { ShowUnshowFormService } from '../../../services/utils/show-unshow-form.service';
import { AuthService } from '../../../services/auth/auth.service';
import { TeamService } from '../../../services/api/team.service';
import { IGroup, IUser } from '../../../types';
import { MemberService } from '../../../services/api/member.service';
import { ActivatedRoute } from '@angular/router';
import { MemberFormComponent } from '../member-form/member-form.component';

@Component({
  selector: 'app-member',
  standalone: true,
  imports: [MemberListComponent],
  templateUrl: './member.component.html',
  styleUrl: './member.component.css',
})
export class MemberComponent implements OnInit {
  toast = inject(ToastService);
  showFormService = inject(ShowUnshowFormService);
  authService = inject(AuthService);
  teamService = inject(TeamService);
  memberService = inject(MemberService);
  activatedRoute = inject(ActivatedRoute);

  // member!: IUser;
  isData: boolean = false;
  isEnableAddUserForm: boolean = false;
  isEditMode: boolean = false;
  isAddMode: boolean = false;
  selectedDataIndex!: number;

  members: IUser[] = [];

  isEnableAssginForm: boolean = false;

  // @Input() team!: ITeam;
  routeId!: string;

  ngOnInit(): void {
    // this.routegroupId = this.activatedRoute.parent?.snapshot.params['id'];
    console.log('initialised');

    this.fetch();
    this.showFormService.showForm$.subscribe((res) => {
      this.isEnableAddUserForm = res;
    });
  }

  onActivateForm(e: any) {
    this.isAddMode = true;
    this.isEditMode = false;
    this.isEnableAddUserForm = true;
  }

  activateAssignForm(e: any) {
    console.log('clicked');

    if (e === true) {
      this.isEnableAddUserForm = e;
    } else {
      this.isEnableAddUserForm = e;
    }
  }

  fetch() {
    if (this.memberService.memberListSubject.getValue().length > 0) {
      this.members = this.memberService.memberListSubject.value;
      this.isData = true;
    } else {
      this.routeId = this.activatedRoute.parent?.snapshot.params['id'];
      if (!this.routeId) {
        this.memberService.getMembers<IUser>(this.routeId).subscribe({
          next: (res: any) => {
            this.members = res.data.members;
            this.memberService.memberListSubject.next(res.data.members);
            this.isData = true;
          },
          error: (error) =>
            this.toast.danger(`Error in getting Teams. ${error.error}`),
        });
      } else {
        this.memberService.getProjectMembers<IUser>(this.routeId).subscribe({
          next: (res: any) => {
            this.memberService.memberListSubject.next(res.data.members);
            this.members = res.data.members;
            this.isData = true;
          },
          error: (error) =>
            this.toast.danger(`Error in getting Teams. ${error.error}`),
        });
      }
    }
  }

  handlePostRequest(formValue: any, groupId: any) {
    this.memberService.post(formValue, groupId).subscribe({
      next: (data) => {
        this.memberService.memberListSubject.subscribe((oldData) => {
          oldData.push(data);
        });
        this.toast.success('Sussessfully added Team');
      },
      error: (error) => this.toast.danger(`Failed to edit Team ${error.error}`),
    });
  }

  deleteData(e: any, groupId: any) {
    this.memberService.delete(e.id, groupId).subscribe({
      next: (res: any) => {
        this.memberService.memberListSubject.subscribe((data) => {
          data.splice(e.index, 1);
        });
        this.toast.success(res.message);
      },
      error: (error) =>
        this.toast.danger(`Failed to delete service. ${error.error}`),
    });
  }

  closeTeamForm(e: any) {
    this.isEnableAddUserForm = false;
  }
}
