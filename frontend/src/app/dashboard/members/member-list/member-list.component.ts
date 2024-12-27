import { Component, inject, Input, OnInit } from '@angular/core';
import { MemberService } from '../../../services/api/member.service';
import { IUser } from '../../../types';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css',
})
export class MemberListComponent implements OnInit {
  memberService = inject(MemberService);

  @Input() members: IUser[] = [];
  ngOnInit(): void {
    console.log(this.members);

    this.memberService.memberList$.subscribe((data: IUser[]) => {
      console.log(data);
      this.members = data;
    });
  }
}
