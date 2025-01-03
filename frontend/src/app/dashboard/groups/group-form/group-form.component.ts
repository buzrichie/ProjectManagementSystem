import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { UserService } from '../../../services/api/user.service';
import { ToastService } from '../../../services/utils/toast.service';
import { IGroup, IUser } from '../../../types';
import { CommonModule } from '@angular/common';
import { BtnUnshowformComponent } from '../../../shared/btn-unshowform/btn-unshowform.component';
import { MemberService } from '../../../services/api/member.service';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BtnUnshowformComponent],
  templateUrl: './group-form.component.html',
  styleUrl: './group-form.component.css',
})
export class GroupFormComponent implements OnInit {
  toast = inject(ToastService);
  userService = inject(UserService);
  @Input() isEditMode: boolean = false;
  @Input() isAddMode: boolean = false;
  @Input() team!: IGroup | null;
  @Output() onPostRequest = new EventEmitter();
  @Output() onPutRequest = new EventEmitter();
  @Output() onCloseForm = new EventEmitter();

  groupForm: FormGroup;
  teamImageFile!: File;
  isLoading = false;

  memberList: IUser[] = [];
  supervisorList: IUser[] = [];

  queriedMembers: IUser[] = [];
  selectedMembers: IUser[] = [];
  filteredMembers: IUser[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private memberService: MemberService
  ) {
    this.groupForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      // members: ['', [Validators.required, Validators.maxLength(100)]],
      memberSearch: ['', [Validators.required]],
    });
  }
  ngOnInit(): void {
    if (this.isEditMode === true && this.team) {
      this.groupForm.patchValue(this.team);
    }
    if (this.isAddMode === true) {
      this.groupForm.reset();
    }
    // if (this.userService.adminListSubject.getValue()!.length < 1) {
    //   this.userService.getUsersByRole('supervisor').subscribe({
    //     next: (res) => {
    //       console.log(res);
    //       this.userService.adminListSubject.next(res);
    //     },
    //     error: () => {},
    //   });
    // }

    // this.userService.getMenbers().subscribe({
    //   next: (res: any) => {
    //     this.memberList = res;
    //   },
    //   error: () => {},
    // });
    this.memberService.queryUsers().subscribe({
      next: (res: IUser[]) => {
        this.queriedMembers = res;
        this.filteredMembers = res;
      },
      error: (err) => {
        console.error('Error fetching members:', err);
      },
    });
    this.userService.getAdmins().subscribe({
      next: (res: any) => {
        this.supervisorList = res;
      },
      error: () => {},
    });
  }

  closeForm(e: any) {
    this.onCloseForm.emit(e);
  }

  onImageSelected(event: any) {
    this.teamImageFile = event.target.files[0];
  }

  // Handle member selection (optional custom logic)
  onMemberSelected(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedOptions = Array.from(target.selectedOptions).map(
      (option) => option.value
    );

    this.groupForm.patchValue({ members: selectedOptions });
  }

  onSelectMember(member: IUser) {
    if (!this.selectedMembers.some((m) => m._id === member._id)) {
      this.selectedMembers.push(member);
    }
    // Clear search input and filtered list
    this.groupForm.get('memberSearch')?.reset();
    this.filteredMembers = this.queriedMembers;
  }

  removeMember(memberId: string) {
    this.selectedMembers = this.selectedMembers.filter(
      (member) => member._id !== memberId
    );
  }

  teamSubmit() {
    console.log(this.groupForm.value);

    if (this.name !== null && this.selectedMembers.length > 0) {
      if (this.isEditMode === true) {
        // console.log('the form value', this.teamForm.value);
        this.onPutRequest.emit(this.groupForm.value);
      }
      if (this.isAddMode === true) {
        const selectedMemberIds = this.selectedMembers.map(
          (member) => member._id!
        );
        if (selectedMemberIds.length == 0) {
          return;
        }

        this.onPostRequest.emit({
          ...this.groupForm.value,
          members: selectedMemberIds,
        });
        return this.groupForm.reset();
      }
    }
  }

  // onMemberSearch() {
  //   console.log(this.members?.value);
  //   const member = this.members?.value;
  //   const filteredList = this.memberList.filter(
  //     (e) => e.username.toLowerCase() === member.toLowerCase()
  //   );
  //   if (filteredList.length < 1) {
  //     this.userService.searchMenbers(member);
  //   }
  // }

  onMemberSearch() {
    console.log(this.memberSearch?.value);

    const username = this.memberSearch?.value;
    const filteredList = this.queriedMembers.filter(
      (e) => e.username.toLowerCase() === username.toLowerCase()
    );
    console.log(filteredList);

    if (filteredList.length < 1) {
      this.memberService.searchUsers(username);
    }
  }

  onManagerSearch() {
    const manager = this.supervisor?.value;
    const filteredList = this.supervisorList.filter(
      (e) => e.username.toLowerCase() === manager.toLowerCase()
    );
    if (filteredList.length < 1) {
      this.userService.searchAdmins(manager);
    }
  }

  // convenience getters for easy access to form controls
  get name() {
    return this.groupForm.get('name');
  }
  get description() {
    return this.groupForm.get('description');
  }
  get startDate() {
    return this.groupForm.get('startDate');
  }
  get endDate() {
    return this.groupForm.get('endDate');
  }
  get supervisor() {
    return this.groupForm.get('supervisor');
  }
  get name2() {
    return this.groupForm.get('name');
  }
  get members() {
    return this.groupForm.get('members');
  }

  get memberSearch() {
    return this.groupForm.get('memberSearch');
  }
}
