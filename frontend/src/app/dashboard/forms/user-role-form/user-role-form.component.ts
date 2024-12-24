import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../services/api/user.service';
import { BtnUnshowformComponent } from '../../../shared/btn-unshowform/btn-unshowform.component';
import { CommonModule } from '@angular/common';
import { IUser } from '../../../types';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-user-role-form',
  standalone: true,
  imports: [BtnUnshowformComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './user-role-form.component.html',
  styleUrl: './user-role-form.component.css',
})
export class UserRoleFormComponent {
  authService = inject(AuthService);

  roleChangeForm!: FormGroup;

  userRole: IUser['role'];

  @Input() user!: IUser;
  @Output() onCloseForm = new EventEmitter();
  @Output() onRoleChanged = new EventEmitter();

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.initForm();
  }

  // Initialize the form
  initForm(): void {
    this.roleChangeForm = this.fb.group({
      role: ['', Validators.required],
    });
    this.authService.authUser$.subscribe((data) => {
      this.userRole = data?.role;
    });
  }

  // Submit the role change request
  submitRoleChange(): void {
    if (this.roleChangeForm.valid) {
      this.userService
        .put(this.user?._id!, this.roleChangeForm.value)
        .subscribe({
          next: (res) => {
            console.log('Role changed successfully:', res);
            this.userService.userListSubject.subscribe((users) => {
              let index = users.findIndex((user: IUser) => user._id == res._id);
              users[index] = res;
            });
            this.onRoleChanged.emit(res); // Notify the parent component
            this.closeForm();
          },
          error: (err) => {
            console.error('Error changing role:', err);
          },
        });
    }
  }

  // Close the form
  closeForm(): void {
    this.onCloseForm.emit();
  }
}
