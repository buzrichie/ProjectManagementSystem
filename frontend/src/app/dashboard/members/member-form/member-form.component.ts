import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MemberService } from '../../../services/api/member.service';
import { IGroup as IProject, IGroup, IUser } from '../../../types';
import { BtnUnshowformComponent } from '../../../shared/btn-unshowform/btn-unshowform.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [BtnUnshowformComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './member-form.component.html',
  styleUrl: './member-form.component.css',
})
export class MemberFormComponent {
  fb = inject(FormBuilder);

  memberService = inject(MemberService);

  queriedMembers: IUser[] = [];
  selectedMembers: IUser[] = [];
  filteredMembers: IUser[] = [];

  membersForm!: FormGroup;
  isEnableForm: boolean = true;

  @Input() projectId: IProject['_id'];
  @Input() groupId: IGroup['_id'];

  @Output() onCloseForm = new EventEmitter();

  constructor() {
    this.membersForm = this.fb.group({
      memberSearch: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Fetch all members initially
    this.memberService.queryUsers().subscribe({
      next: (res: IUser[]) => {
        this.queriedMembers = res;
        this.filteredMembers = res;
      },
      error: (err) => {
        console.error('Error fetching members:', err);
      },
    });
  }

  onMemberSearch() {
    const username = this.memberSearch?.value;
    const filteredList = this.queriedMembers.filter(
      (e) => e.username.toLowerCase() === username.toLowerCase()
    );

    if (filteredList.length < 1) {
      this.memberService.searchUsers(username);
    }
  }

  onSelectMember(member: IUser) {
    if (!this.selectedMembers.some((m) => m._id === member._id)) {
      this.selectedMembers.push(member);
    }
    // Clear search input and filtered list
    this.membersForm.get('memberSearch')?.reset();
    this.filteredMembers = this.queriedMembers;
  }

  onSubmit() {
    const selectedMemberIds = this.selectedMembers.map((member) => member._id);

    this.memberService.post(selectedMemberIds, this.groupId).subscribe({
      next: (res) => {
        console.log('Members assigned successfully:', res);
        // Optionally reset form
        this.selectedMembers = [];
        this.membersForm.reset();
      },
      error: (err) => {
        console.error('Error assigning members:', err);
      },
    });
  }

  removeMember(memberId: string) {
    this.selectedMembers = this.selectedMembers.filter(
      (member) => member._id !== memberId
    );
  }

  closeForm(e: any) {
    this.isEnableForm = false;
    this.onCloseForm.emit(e);
  }

  get memberSearch() {
    return this.membersForm.get('memberSearch');
  }
}
