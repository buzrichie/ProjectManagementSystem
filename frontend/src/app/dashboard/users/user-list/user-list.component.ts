import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UserService } from '../../../services/api/user.service';
import { IUser } from '../../../types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent {
  userService = inject(UserService);

  @Input() users: IUser[] = [];
  @Output() onSelectedProject = new EventEmitter();

  ngOnInit(): void {
    // this.userService.userList$.subscribe(
    //   (data: IUser[]) => (this.users = data)
    // );
  }

  selected(e: { data: IUser; index: number }) {
    this.onSelectedProject.emit(e);
  }
}
