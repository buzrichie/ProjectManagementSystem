import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IUser } from '../../../types';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/api/user.service';
import { BtnAddComponent } from '../../btn-add/btn-add.component';
import { UserRoleFormComponent } from '../../forms/user-role-form/user-role-form.component';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [BtnAddComponent, UserRoleFormComponent],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css',
})
export class UserDetailsComponent implements OnInit {
  backendUrl = environment.backendUrl;
  user!: IUser;
  actChangeRoleF: boolean = false;

  route = inject(ActivatedRoute);
  userService = inject(UserService);
  authService = inject(AuthService);

  routeId: string = '';

  ngOnInit(): void {
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
}
