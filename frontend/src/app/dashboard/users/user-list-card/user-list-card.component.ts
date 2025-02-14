import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IUser } from '../../../types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-list-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-list-card.component.html',
  styleUrl: './user-list-card.component.css',
})
export class UserListCardComponent {
  @Input() userList!: IUser[];

  @Output() onSelectedProject = new EventEmitter();

  selected(e: { data: IUser; index: number }) {
    this.onSelectedProject.emit(e);
  }
}
