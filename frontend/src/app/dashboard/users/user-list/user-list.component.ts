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

  filterCriteria: string = 'all';

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
  // Set the filter criteria and apply the filter
  setFilter(filter: string) {
    this.filterCriteria = filter;
    this.filterData();
  }

  // Filter data based on role and search term
  filterData() {
    this.filteredUsers = this.users.filter((user) => {
      const matchesSearchTerm = user.username
        .toLowerCase()
        .includes(this.searchControl.value.toLowerCase());

      let matchesFilter = false;

      // Apply role-based filtering
      switch (this.filterCriteria) {
        case 'all':
          matchesFilter = true;
          break;
        case 'student':
          matchesFilter = user.role === 'student';
          break;
        case 'supervisor':
          matchesFilter = user.role === 'supervisor';
          break;
        case 'project_coordinator':
          matchesFilter = user.role === 'project_coordinator';
          break;
      }

      // Return true only if both search and filter criteria match
      return matchesSearchTerm && matchesFilter;
    });
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
