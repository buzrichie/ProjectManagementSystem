import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IUser } from '../../../types';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/api/user.service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css',
})
export class UserDetailsComponent implements OnInit {
  backendUrl = environment.backendUrl;
  user!: IUser;

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
}
