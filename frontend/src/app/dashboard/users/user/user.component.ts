import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserDetailsComponent } from '../user-details/user-details.component';
import { UserFormComponent } from '../user-form/user-form.component';
import { TableComponent } from '../table/table.component';
import { IUser } from '../../../types';
import { ToastService } from '../../../services/utils/toast.service';
import { BtnAddComponent } from '../../btn-add/btn-add.component';
import { ShowUnshowFormService } from '../../../services/utils/show-unshow-form.service';
import { UserService } from '../../../services/api/user.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    UserFormComponent,
    TableComponent,
    RouterOutlet,
    // UserDetailsComponent,
    BtnAddComponent,
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent implements OnInit {
  private url = `/api/user/`;

  toast = inject(ToastService);
  showFormService = inject(ShowUnshowFormService);
  userService = inject(UserService);
  authService = inject(AuthService);
  user: IUser = {
    username: '',
    password: '',
  };
  selectedDataIndex!: number;

  isData: boolean = false;
  isFormVisible: boolean = false;
  isEditMode: boolean = false;
  isAddMode: boolean = false;

  ngOnInit(): void {
    this.fetch();
    this.showFormService.showForm$.subscribe((res) => {
      this.isFormVisible = res;
    });
  }

  showForm(selected: any) {
    this.isEditMode = true;
    this.isAddMode = false;
    this.user = selected.user;
    this.selectedDataIndex = selected.index;
  }

  postRequestForm() {
    this.isAddMode = true;
    this.isEditMode = false;
    this.user = {
      username: '',
      password: '',
    };
  }

  fetch() {
    if (this.userService.userListSubject.getValue().length > 1) {
      this.isData = true;
    } else {
      this.userService.getUsers<IUser>().subscribe((data: IUser[]) => {
        this.userService.userListSubject.next(data);
        this.isData = true;
      });
    }
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
        this.userService.userListSubject.subscribe((data) => {
          data.splice(e.index, 1);
        });
        this.toast.success(res.message);
      },
      error: (error) =>
        this.toast.danger(`Failed to delete service. ${error.error}`),
    });
    // }
    //   },
    // });
  }
}
