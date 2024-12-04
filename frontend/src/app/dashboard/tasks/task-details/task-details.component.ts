import { Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../services/api/task.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ITask } from '../../../types';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.css',
})
export class TaskDetailsComponent implements OnInit {
  backendUrl = environment.backendUrl;
  route = inject(ActivatedRoute);
  taskService = inject(TaskService);
  authService = inject(AuthService);

  routeId: string = '';
  task!: ITask;

  fileForm: FormGroup;

  isEnableAssginForm: boolean = false;
  isEnableTaskForm: boolean = false;

  constructor(private fb: FormBuilder) {
    this.fileForm = this.fb.group({
      file: [null], // Control for the file
    });
  }

  ngOnInit(): void {
    this.routeId = this.route.snapshot.params['id'];
    if (this.taskService.taskListSubject.getValue().length < 1) {
      this.taskService.getOne<ITask>(`${this.routeId}`).subscribe({
        next: (data: ITask) => {
          this.task = data;
        },
      });
    } else {
      this.taskService.taskList$.subscribe((projects: ITask[]) => {
        this.task = projects.find((project) => project._id === this.routeId)!;
      });
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileForm.patchValue({
        file: file,
      });
    }
  }

  // Submit file to backend
  onSubmit() {
    if (this.fileForm.invalid) return;
    const formData = new FormData();
    formData.append('file', this.fileForm.get('file')!.value);
    console.log(formData, this.task._id);
    this.taskService.taskUpload(formData, this.task._id).subscribe({
      next: (response) => console.log('Upload successful!', response),
      error: (error) => console.error('Upload failed:', error),
    });
  }

  activateAssignForm(e: any) {
    if (e === true) {
      this.isEnableAssginForm = e;
    } else {
      this.isEnableAssginForm = e;
    }
  }

  activateTaskForm(e: any) {
    console.log(e);

    if (e === true) {
      this.isEnableTaskForm = e;
    } else {
      this.isEnableTaskForm = e;
    }
  }

  postRequest(e: any) {
    console.log(e);

    this.isEnableTaskForm = e;
  }

  closeTaskForm(e: any) {
    this.isEnableTaskForm = e;
  }
}
