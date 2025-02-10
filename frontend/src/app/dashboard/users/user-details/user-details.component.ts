import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IUser } from '../../../types';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/api/user.service';
import { BtnAddComponent } from '../../btn-add/btn-add.component';
import { UserRoleFormComponent } from '../../forms/user-role-form/user-role-form.component';
import { AssignSupervisorToStudentFormComponent } from '../../forms/assign-supervisor-to-student-form/assign-supervisor-to-student-form.component';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    AssignSupervisorToStudentFormComponent,
    BtnAddComponent,
    UserRoleFormComponent,
  ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css',
})
export class UserDetailsComponent implements OnInit {
  backendUrl = environment.backendUrl;
  user!: IUser;
  actChangeRoleF: boolean = false;
  isAssignS_SForm: boolean = false;

  route = inject(ActivatedRoute);
  userService = inject(UserService);
  authService = inject(AuthService);
  router = inject(Router);
  userRole: IUser['role'];

  routeId: string = '';

  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.userRole = data?.role;
    });
    this.userService.cUser$.subscribe((data) => {
      if (!data) return;
      this.user = data;
    });
    if (!this.userService.cUserSubject.value) {
      this.routeId = this.route.snapshot.params['id'];
      if (this.userService.userListSubject.getValue().length < 1) {
        this.userService.getOne<IUser>(`${this.routeId}`).subscribe({
          next: (data: IUser) => {
            this.user = data;
          },
        });
      } else {
        this.userService.userList$.subscribe((users: IUser[]) => {
          this.user = users.find((user) => user._id === this.routeId)!;
        });
      }
    }
  }
  promote(e: IUser) {
    this.actChangeRoleF = true;
    // this.userService
    //   .put(e._id!, {
    //     ...this.user,
    //     role: 'coordinator',
    //   })
    //   .subscribe({
    //     next: (data) => {
    //       this.userService.userListSubject.subscribe((users) => {
    //         let index = users.findIndex((user: IUser) => user._id == data._id);
    //         users[index] = data;
    //       });
    //     },
    //     error: (err) => {
    //       console.log(err);
    //     },
    //   });
  }
  closeUserRoleForm() {
    this.actChangeRoleF = false;
  }
  roleChanged(e: IUser) {
    this.user = e;
  }

  goToChat(): void {
    this.router.navigate(['/admin/chat'], {
      queryParams: { receiverId: this.user._id },
    });
  }
  ActAssignForm() {
    this.isAssignS_SForm = true;
  }
  closeAssignForm() {
    this.isAssignS_SForm = false;
  }
}
