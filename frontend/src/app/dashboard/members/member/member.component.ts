import { Component, inject, Input, OnInit } from '@angular/core';
import { MemberListComponent } from '../member-list/member-list.component';
import { BtnAddComponent } from '../../btn-add/btn-add.component';
import { ToastService } from '../../../services/utils/toast.service';
import { ShowUnshowFormService } from '../../../services/utils/show-unshow-form.service';
import { AuthService } from '../../../services/auth/auth.service';
import { TeamService } from '../../../services/api/team.service';
import { IGroup, IProject, IUser } from '../../../types';
import { MemberService } from '../../../services/api/member.service';
import { ActivatedRoute } from '@angular/router';
import { MemberFormComponent } from '../member-form/member-form.component';
import { UserListCardComponent } from '../../users/user-list-card/user-list-card.component';

@Component({
  selector: 'app-member',
  standalone: true,
  imports: [MemberListComponent, UserListCardComponent],
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
    if (e === true) {
      this.isEnableAddUserForm = e;
    } else {
      this.isEnableAddUserForm = e;
    }
  }

  // fetch() {
  //   if (this.memberService.memberListSubject.getValue().length > 0) {
  //     this.members = this.memberService.memberListSubject.value;
  //     this.isData = true;
  //   } else {
  //     this.routeId = this.activatedRoute.parent?.snapshot.params['id'];
  //     if (!this.routeId) {
  //       this.memberService.getGroupMembers<IUser>(this.routeId).subscribe({
  //         next: (res: any) => {
  //           this.members = res.data.members;
  //           this.memberService.memberListSubject.next(res.data.members);
  //           this.isData = true;
  //         },
  //         error: (error) =>
  //           this.toast.danger(`Error in getting Teams. ${error.error}`),
  //       });
  //     } else {
  //       this.memberService.getProjectMembers<IUser>(this.routeId).subscribe({
  //         next: (res: any) => {
  //           this.memberService.memberListSubject.next(res.data.members);
  //           this.members = res.data.members;
  //           this.isData = true;
  //         },
  //         error: (error) =>
  //           this.toast.danger(`Error in getting Teams. ${error.error}`),
  //       });
  //     }
  //   }
  // }
  fetch() {
    const routeId = this.activatedRoute.parent?.snapshot.params['id'];
    if (!routeId) return;
    if (this.memberService.projectMemberListSubject.getValue().length < 1) {
      // if (routeId) {
      this.memberService.getProjectMembers<IUser>(routeId).subscribe({
        next: (res: { data: { _id: IProject['_id']; members: IUser[] } }) => {
          this.members = res.data.members;

          this.memberService.projectMemberListSubject.next([res.data]);
        },
        error: (error) =>
          this.toast.danger(`Error in getting Teams. ${error.error}`),
      });
    } else {
      const data = this.memberService.projectMemberListSubject.value;

      const index = data.findIndex((project) => project._id === routeId)!;
      if (index === -1) {
        this.memberService.getProjectMembers<IUser>(routeId).subscribe({
          next: (res: { data: { _id: IProject['_id']; members: IUser[] } }) => {
            this.members = res.data.members;

            this.memberService.projectMemberListSubject.next([
              ...data,
              res.data,
            ]);
          },
          error: (error) =>
            this.toast.danger(`Error in getting Teams. ${error.error}`),
        });
      } else {
        this.members = data[index].members;
      }
      this.isData = true;
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
