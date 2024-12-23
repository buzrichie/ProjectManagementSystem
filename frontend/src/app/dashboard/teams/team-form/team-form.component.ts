import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { ITeam, IUser } from '../../../types';
import { ToastService } from '../../../services/utils/toast.service';
import { BtnUnshowformComponent } from '../../../shared/btn-unshowform/btn-unshowform.component';
import { UserService } from '../../../services/api/user.service';

@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BtnUnshowformComponent],
  templateUrl: './team-form.component.html',
  styleUrl: './team-form.component.css',
})
export class TeamFormComponent implements OnInit {
  toast = inject(ToastService);
  userService = inject(UserService);
  @Input() isEditMode: boolean = false;
  @Input() isAddMode: boolean = false;
  @Input() team!: ITeam | null;
  @Output() onPostRequest = new EventEmitter();
  @Output() onPutRequest = new EventEmitter();
  @Output() onCloseForm = new EventEmitter();

  teamForm: FormGroup;
  teamImageFile!: File;
  isLoading = false;

  memberList: IUser[] = [];
  supervisorList: IUser[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService
  ) {
    // this.teamForm = this.formBuilder.group({
    //   name: ['', [Validators.required, Validators.maxLength(100)]],
    //   description: ['', [Validators.required]],
    //   team: [''],
    //   startDate: ['', [Validators.required]],
    //   endDate: ['', [Validators.required]],
    //   teamManager: ['', [Validators.required]],
    //   status: ['Ongoing', [Validators.required]],
    // });

    this.teamForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      members: ['', [Validators.required, Validators.maxLength(100)]],
      supervisor: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }
  ngOnInit(): void {
    if (this.isEditMode === true && this.team) {
      this.teamForm.patchValue(this.team);
    }
    if (this.isAddMode === true) {
      this.teamForm.reset();
    }
    if (this.userService.adminListSubject.getValue()!.length < 1) {
      this.userService.getUsersByRole('supervisor').subscribe({
        next: (res) => {
          console.log(res);
          this.userService.adminListSubject.next(res);
        },
        error: () => {},
      });
    }

    this.userService.getMenbers().subscribe({
      next: (res: any) => {
        this.memberList = res;
      },
      error: () => {},
    });
    this.userService.getAdmins().subscribe({
      next: (res: any) => {
        this.supervisorList = res;
      },
      error: () => {},
    });
  }

  // ngOnChanges(): void {
  //   if (this.isEditMode === true && this.team) {
  //     console.log(this.team);

  //     this.teamForm.patchValue(this.team);
  //   }
  // }

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

    this.teamForm.patchValue({ members: selectedOptions });
  }

  teamSubmit() {
    console.log(this.teamForm.value);

    if (this.teamForm.valid) {
      if (this.isEditMode === true) {
        // console.log('the form value', this.teamForm.value);
        this.onPutRequest.emit(this.teamForm.value);
      }
      if (this.isAddMode === true) {
        this.onPostRequest.emit(this.teamForm.value);
        return this.teamForm.reset();
      }
    }
  }

  onMemberSearch() {
    console.log(this.members?.value);
    const member = this.members?.value;
    const filteredList = this.memberList.filter(
      (e) => e.username.toLowerCase() === member.toLowerCase()
    );
    if (filteredList.length < 1) {
      this.userService.searchMenbers(member);
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
    return this.teamForm.get('name');
  }
  get description() {
    return this.teamForm.get('description');
  }
  get startDate() {
    return this.teamForm.get('startDate');
  }
  get endDate() {
    return this.teamForm.get('endDate');
  }
  get supervisor() {
    return this.teamForm.get('supervisor');
  }
  get name2() {
    return this.teamForm.get('name');
  }
  get members() {
    return this.teamForm.get('members');
  }
}
