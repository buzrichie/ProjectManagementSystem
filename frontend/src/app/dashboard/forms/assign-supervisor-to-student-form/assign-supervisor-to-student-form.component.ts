import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserService } from '../../../services/api/user.service';
import { CommonModule } from '@angular/common';
import { BtnUnshowformComponent } from '../../../shared/btn-unshowform/btn-unshowform.component';
import { IUser } from '../../../types';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-assign-supervisor-to-student-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, BtnUnshowformComponent],
  templateUrl: './assign-supervisor-to-student-form.component.html',
  styleUrl: './assign-supervisor-to-student-form.component.css',
})
export class AssignSupervisorToStudentFormComponent implements OnInit {
  authService = inject(AuthService);
  assignForm!: FormGroup;
  students: any[] = []; // List of students
  supervisors: any[] = []; // List of supervisors
  userRole: IUser['role'];

  @Output() onCloseForm = new EventEmitter();

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.initForm();

    this.fetchUsers();

    this.authService.authUser$.subscribe((data) => {
      this.userRole = data?.role;
    });
  }

  // Initialize the form
  initForm(): void {
    this.assignForm = this.fb.group({
      studentId: ['', Validators.required],
      supervisorId: ['', Validators.required],
    });
  }

  // Fetch students and supervisors
  fetchUsers(): void {
    this.userService.getUsersByRole('student').subscribe({
      next: (students) => {
        this.students = students;
      },
      error: (err) => {
        console.error('Error fetching students:', err);
      },
    });
    if (this.userService.adminListSubject.getValue()!.length < 1) {
      this.userService.getUsersByRole('supervisor').subscribe({
        next: (supervisors) => {
          this.supervisors = supervisors;
          this.userService.adminListSubject.next(supervisors);
        },
        error: (err) => {
          console.error('Error fetching supervisors:', err);
        },
      });
    } else {
      this.supervisors = this.userService.adminListSubject.value!;
    }
  }

  // Submit the assignment
  submitAssignment(): void {
    if (this.assignForm.valid) {
      this.userService
        .assignSupervisorToStudent(this.assignForm.value)
        .subscribe({
          next: (res) => {
            console.log('Assignment successful:', res);
            this.closeForm();
          },
          error: (err) => {
            console.error('Error assigning supervisor:', err);
          },
        });
    }
  }

  // Close the form
  closeForm(): void {
    this.onCloseForm.emit();
  }
}
