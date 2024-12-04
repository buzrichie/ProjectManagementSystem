import { Component, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// import { TaskServic }
import { UserService } from '../../../services/api/user.service';
import { ProjectService } from '../../../services/api/project.service';
import { TaskService } from '../../../services/api/task.service';
import { BtnUnshowformComponent } from '../../../shared/btn-unshowform/btn-unshowform.component';
import { CommonModule } from '@angular/common';
import { EventEmitter } from '@angular/core';
import { ITask } from '../../../types';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [BtnUnshowformComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  users: any[] = [];
  projects: any[] = [];
  tasks: any[] = [];
  dependencies: string[] = []; // Stores selected dependency IDs
  isLoading = false;

  @Input() isEditMode: boolean = false;
  @Input() isAddMode: boolean = false;
  @Input() task!: ITask | null;
  @Input() currentProject!: string;
  @Output() onCloseForm = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private userService: UserService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadUsers();
    // this.loadProjects();
    // this.loadTasks();
  }

  closeForm(e: any) {
    this.onCloseForm.emit(e);
  }

  // Initialize the Reactive Form
  private initializeForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      assignedTo: [''],
      dueDate: ['', [Validators.required]],
      // project: ['', [Validators.required]],
      status: ['open'],
      priority: ['medium'],
      // dependencies: [[]],
    });
  }

  // Load Users from API
  private loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe(
      (users) => {
        this.users = users;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    );
  }

  // Load Projects from API
  private loadProjects(): void {
    this.isLoading = true;
    this.projectService.getProjectsByQuery().subscribe(
      (projects) => {
        this.projects = projects;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading projects:', error);
        this.isLoading = false;
      }
    );
  }

  // Load Tasks from API
  private loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks().subscribe(
      (tasks) => {
        this.tasks = tasks;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      }
    );
  }

  // Handle dependency selection
  onDependencySelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const selectedDependency = target.value;

    if (!this.dependencies.includes(selectedDependency)) {
      this.dependencies.push(selectedDependency);
    }

    // Update the dependencies field in the form
    this.taskForm.patchValue({
      dependencies: this.dependencies,
    });
  }

  // Submit the form
  submitTask(): void {
    console.log(this.taskForm.value);

    if (this.taskForm.invalid) {
      alert('Please fill in all required fields');
      return;
    }

    this.isLoading = true;

    // Send task data to the backend
    this.taskService.post(this.taskForm.value, this.currentProject).subscribe({
      next: (response) => {
        alert('Task created successfully!');
        this.taskForm.reset();
        this.dependencies = [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating task:', error);
        alert('Failed to create task.');
        this.isLoading = false;
      },
    });
  }

  get dueDate() {
    return this.taskForm.get('dueDate');
  }
  get assignedTo() {
    return this.taskForm.get('assignedTo');
  }
}
