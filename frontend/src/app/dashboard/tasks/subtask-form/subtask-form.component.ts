import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TaskService } from '../../../services/api/task.service';
import { UserService } from '../../../services/api/user.service';
import { BtnUnshowformComponent } from '../../../shared/btn-unshowform/btn-unshowform.component';
import { CommonModule } from '@angular/common';
import { SubtaskService } from '../../../services/api/subtask.service';
import { ITask } from '../../../types';

@Component({
  selector: 'app-subtask-form',
  standalone: true,
  imports: [BtnUnshowformComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './subtask-form.component.html',
  styleUrl: './subtask-form.component.css',
})
export class SubtaskFormComponent implements OnInit {
  subtaskForm!: FormGroup;

  tasks: any[] = []; // List of available parent tasks
  users: any[] = []; // List of available users for assignment

  @Input() editMode: boolean = false; // Whether it's editing an existing subtask
  @Input() subtask: any; // Existing subtask data for editing
  @Output() onCloseForm = new EventEmitter();
  @Input() currentTaskData!: ITask;

  constructor(
    private fb: FormBuilder,
    private subtaskService: SubtaskService,
    private taskService: TaskService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initForm();
    // this.fetchTasks();
    // this.fetchUsers();
    if (this.editMode && this.subtask) {
      this.subtaskForm.patchValue(this.subtask);
    }
    // if (this.isAddMode === true) {
    //   this.taskForm.reset();
    // }
  }

  initForm(): void {
    this.subtaskForm = this.fb.group({
      name: ['', Validators.required],
      assignedTo: [''],
      status: ['open', Validators.required],
      priority: ['medium', Validators.required],
    });
  }

  // fetchTasks(): void {
  //   this.taskService.getAllTasks().subscribe({
  //     next: (tasks) => {
  //       this.tasks = tasks;
  //     },
  //     error: (err) => {
  //       console.error('Error fetching tasks:', err);
  //     },
  //   });
  // }

  // fetchUsers(): void {
  //   this.userService.getAllUsers().subscribe({
  //     next: (users) => {
  //       this.users = users;
  //     },
  //     error: (err) => {
  //       console.error('Error fetching users:', err);
  //     },
  //   });
  // }

  onSubmit(): void {
    if (this.subtaskForm.valid) {
      if (this.editMode) {
        this.subtaskService
          .put(this.subtask._id, this.subtaskForm.value)
          .subscribe({
            next: (res) => {
              console.log('Subtask updated successfully:', res);
              this.closeForm();
            },
            error: (err) => {
              console.error('Error updating subtask:', err);
            },
          });
      } else {
        this.subtaskService
          .post(this.subtaskForm.value, this.currentTaskData._id)
          .subscribe({
            next: (res) => {
              console.log('Subtask created successfully:', res);
              this.closeForm();
            },
            error: (err) => {
              console.error('Error creating subtask:', err);
            },
          });
      }
    }
  }

  closeForm(): void {
    this.onCloseForm.emit();
  }
}
