import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UserService } from '../../../services/api/user.service';
import { IUser } from '../../../types';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ScrollService } from '../../../services/utils/scroll.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent {
  userService = inject(UserService);
  scrollService = inject(ScrollService);
  authService = inject(AuthService);

  @Input() users: IUser[] = [];
  @Output() onSelectedProject = new EventEmitter();
  @Output() onPaginationFetch = new EventEmitter();
  userRole: IUser['role'];

  filteredUsers: IUser[] = [];
  searchControl: FormControl = new FormControl('');

  previousScrollTop = 0;
  @Input() isLoading!: boolean;
  @Input() page!: number;
  @Input() totalPages!: number;

  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.userRole = data?.role;
    });

    this.userService.userList$.subscribe((data: IUser[]) => {
      this.users = data;
      this.filterData();
    });
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
  onScroll(event: any) {
    this.scrollService.onScroll(
      event,
      this.page,
      this.totalPages,
      this.isLoading,
      this.onPaginationFetch,
      this.previousScrollTop
    );
  }
}
