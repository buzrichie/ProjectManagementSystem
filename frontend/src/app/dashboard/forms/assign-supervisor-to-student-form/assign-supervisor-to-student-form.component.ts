import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserService } from '../../../services/api/user.service';
import { CommonModule } from '@angular/common';
import { BtnUnshowformComponent } from '../../../shared/btn-unshowform/btn-unshowform.component';

@Component({
  selector: 'app-assign-supervisor-to-student-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, BtnUnshowformComponent],
  templateUrl: './assign-supervisor-to-student-form.component.html',
  styleUrl: './assign-supervisor-to-student-form.component.css',
})
export class AssignSupervisorToStudentFormComponent implements OnInit {
  assignForm!: FormGroup;
  students: any[] = []; // List of students
  supervisors: any[] = []; // List of supervisors

  @Output() onCloseForm = new EventEmitter();

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.initForm();
    this.fetchUsers();
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

    this.userService.getUsersByRole('supervisor').subscribe({
      next: (supervisors) => {
        this.supervisors = supervisors;
      },
      error: (err) => {
        console.error('Error fetching supervisors:', err);
      },
    });
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
