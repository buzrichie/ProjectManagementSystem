import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UserService } from '../../../services/api/user.service';
import { IUser } from '../../../types';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent {
  userService = inject(UserService);

  @Input() users: IUser[] = [];
  @Output() onSelectedProject = new EventEmitter();
  authService = inject(AuthService);
  userRole: IUser['role'];

  filteredUsers: IUser[] = [];
  searchControl: FormControl = new FormControl('');

  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.userRole = data?.role;
    });
    this.filterData();
    // this.userService.userList$.subscribe(
    //   (data: IUser[]) => (this.users = data)
    // );
  }

  selected(e: { data: IUser; index: number }) {
    this.onSelectedProject.emit(e);
  }
  filterData() {
    this.filteredUsers =
      this.users.filter((user) =>
        user.username
          .toLowerCase()
          .includes(this.searchControl.value.toLowerCase())
      ) || this.users;
  }
}
