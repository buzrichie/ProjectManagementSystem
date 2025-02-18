import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MemberService } from '../../../services/api/member.service';
import { IGroup, IUser } from '../../../types';
import { ToastService } from '../../../services/utils/toast.service';
import { UserListCardComponent } from '../../users/user-list-card/user-list-card.component';

@Component({
  selector: 'app-group-members',
  standalone: true,
  imports: [UserListCardComponent],
  templateUrl: './group-members.component.html',
  styleUrl: './group-members.component.css',
})
export class GroupMembersComponent implements OnInit {
  memberService = inject(MemberService);
  activatedRoute = inject(ActivatedRoute);
  toast = inject(ToastService);

  members: IUser[] = [];
  isLoading: boolean = false;
  routeId!: string;

  ngOnInit(): void {
    // this.activatedRoute.parent!.params.subscribe((params) => {
    // this.fetch(params['id']);
    this.fetch();
    // });
  }

  fetch() {
    const routeId = this.activatedRoute.parent?.snapshot.params['id'];
    if (!routeId) return;
    if (this.memberService.groupMemberListSubject.getValue().length < 1) {
      // if (routeId) {
      this.isLoading = true;
      this.memberService.getGroupMembers<IUser>(routeId).subscribe({
        next: (res: { _id: IGroup['_id']; members: IUser[] }) => {
          this.members = res.members;
          this.memberService.groupMemberListSubject.next([res]);
          this.isLoading = false;
        },
        error: (error) => {
          this.toast.danger(`Error in getting Teams. ${error.error}`);
          this.isLoading = false;
        },
      });
    } else {
      const data = this.memberService.groupMemberListSubject.value;

      const index = data.findIndex((group) => group._id === routeId)!;
      if (index === -1) {
        this.isLoading = true;
        this.memberService.getGroupMembers<IUser>(routeId).subscribe({
          next: (res: { _id: IGroup['_id']; members: IUser[] }) => {
            this.members = res.members;
            this.memberService.groupMemberListSubject.next([...data, res]);
            this.isLoading = false;
          },
          error: (error) => {
            this.toast.danger(`Error in getting Teams. ${error.error}`);
            this.isLoading = false;
          },
        });
      } else {
        this.members = data[index].members;
      }
      this.isLoading = false;
    }
  }
}
