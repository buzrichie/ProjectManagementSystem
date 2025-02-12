import { Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { UserDetailsComponent } from '../user-details/user-details.component';
import { UserFormComponent } from '../user-form/user-form.component';
import { TableComponent } from '../table/table.component';
import { IUser } from '../../../types';
import { ToastService } from '../../../services/utils/toast.service';
import { BtnAddComponent } from '../../btn-add/btn-add.component';
import { ShowUnshowFormService } from '../../../services/utils/show-unshow-form.service';
import { UserService } from '../../../services/api/user.service';
import { AuthService } from '../../../services/auth/auth.service';
import { AssignSupervisorToStudentFormComponent } from '../../forms/assign-supervisor-to-student-form/assign-supervisor-to-student-form.component';
import { UserListComponent } from '../user-list/user-list.component';
import { BtnUnshowformComponent } from '../../../shared/btn-unshowform/btn-unshowform.component';
import { BtnTableEditComponent } from '../../../shared/btn-table-edit/btn-table-edit.component';
import { BtnTableDeleteComponent } from '../../../shared/btn-table-delete/btn-table-delete.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    UserFormComponent,

    RouterOutlet,
    // UserDetailsComponent,
    // BtnAddComponent,
    // AssignSupervisorToStudentFormComponent,
    UserListComponent,
    BtnUnshowformComponent,

    BtnTableEditComponent,
    BtnTableDeleteComponent,
    // UserDetailsComponent,
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent implements OnInit {
  toast = inject(ToastService);
  showFormService = inject(ShowUnshowFormService);
  userService = inject(UserService);
  authService = inject(AuthService);
  user: IUser = {
    username: '',
    password: '',
  };
  selectedDataIndex!: number;
  userRole: IUser['role'];
  islistSelected: boolean = false;
  isLgScreen: boolean = false;
  islistSelectedData!: { data: IUser; index: number };
  isData: boolean = false;
  isFormVisible: boolean = false;
  isEditMode: boolean = false;
  isAddMode: boolean = false;
  isAssignS_SForm: boolean = false;
  users: IUser[] = [];

  page = 1;
  pageSize = 20;
  totalPages = 0;
  isLoading = false;

  ngOnInit(): void {
    this.checkScreenSize();
    this.fetch();
    this.showFormService.showForm$.subscribe((res) => {
      this.isFormVisible = res;
    });
    this.authService.authUser$.subscribe((data) => {
      this.userRole = data?.role;
    });
  }

  showForm(selected: any) {
    this.user = selected.user;
    this.selectedDataIndex = selected.index;
    this.isEditMode = true;
    this.isAddMode = false;
  }

  postRequestForm() {
    this.user = {
      username: '',
      password: '',
    };
    this.isAddMode = true;
    this.isEditMode = false;
  }
  ActAssignForm() {
    this.isAssignS_SForm = true;
  }

  closeAssignForm() {
    this.isAssignS_SForm = false;
  }

  fetch(page: number = this.page, pageSize: number = this.pageSize) {
    if (this.isLoading) return;
    this.isLoading = true;

    if (
      this.userService.userListSubject.value.length > 0 &&
      page <= this.page
    ) {
      this.users = this.userService.userListSubject.value;
      this.isData = true;
    } else {
      this.userService.getUsers<IUser>(page, pageSize).subscribe({
        next: (res: any) => {
          const data = [...this.userService.userListSubject.value, ...res.data];
          this.users = data;
          this.userService.userListSubject.next(data);
          this.page = res.currentPage;
          this.totalPages = res.totalPages;
          this.isLoading = false;
          this.isData = true;
        },
        error: (error) => {
          this.isLoading = false;
          this.toast.danger(`Error in getting users. ${error.error}`);
        },
      });
    }
  }

  paginationFetch(e: any) {
    const nextPage = this.page + 1;
    this.fetch(nextPage);
  }

  handlePostRequest(formValue: any) {
    this.userService.post(formValue).subscribe({
      next: (data) => {
        this.userService.userListSubject.subscribe((oldData) => {
          oldData.push(data);
        });
        this.toast.success('Sussessfully Added IUser');
      },
      error: (error) => {
        this.toast.danger(`Failed to add user ${error.error}`);
      },
    });
  }

  handlePutRequest(formValue: any) {
    // this.authService.authUser$.subscribe({
    //   next: (user) => {
    //     if (user) {
    this.userService.put(formValue.target, formValue.value).subscribe({
      next: (data: any) => {
        // find the availabe user and update the datails when the edit is successful
        // will update it to use index
        this.userService.userListSubject.subscribe((users) => {
          users[this.selectedDataIndex] = data;
        });
        this.toast.success('Sussessfully edited user data');
      },
      error: (error) =>
        this.toast.danger(`Failed to edit user data ${error.error}`),
    });
    // }
    //   },
    // });
  }

  deleteData(e: any) {
    // this.authService.authUser$.subscribe({
    //   next: (user) => {
    //     if (user) {
    this.userService.delete(e.id).subscribe({
      next: (res: any) => {
        const data = this.userService.userListSubject.value;
        data.splice(e.index, 1);
        this.userService.userListSubject.next(data);
        this.toast.success(res.message);
      },
      error: (error) =>
        this.toast.danger(`Failed to delete service. ${error.error}`),
    });
  }
  listSelected(e: { data: IUser; index: number }) {
    this.userService.cUserSubject.next(e.data);
    this.islistSelectedData = e;
    this.islistSelected = true;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
    // console.log(this.islistSelected);
    // console.log(this.isLgScreen);
  }

  checkScreenSize() {
    this.isLgScreen = window.innerWidth >= 587;
  }
  closeForm() {
    this.islistSelected = false;
  }
}
