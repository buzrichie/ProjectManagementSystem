import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ProjectService } from '../../../services/api/project.service';
import { TableNavToDetailsService } from '../../../services/utils/table-nav-to-details.service';
import { ApiService } from '../../../services/api/api.service';
import { ITask } from '../../../types';
import { TaskService } from '../../../services/api/task.service';
import { environment } from '../../../../environments/environment';
import { ReactiveFormsModule } from '@angular/forms';
import { BtnTableEditComponent } from '../../../shared/btn-table-edit/btn-table-edit.component';
import { BtnTableDeleteComponent } from '../../../shared/btn-table-delete/btn-table-delete.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-task-table',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    BtnTableEditComponent,
    BtnTableDeleteComponent,
  ],
  templateUrl: './task-table.component.html',
  styleUrl: './task-table.component.css',
})
export class TaskTableComponent {
  backendUrl = environment.backendUrl;
  private taskService = inject(TaskService);
  private navToDetails = inject(TableNavToDetailsService);
  tasks: ITask[] = [];
  @Output() onShowForm = new EventEmitter();
  @Output() onDelete = new EventEmitter();

  constructor(private api: ApiService) {}
  ngOnInit(): void {
    this.taskService.taskList$.subscribe(
      (data: ITask[]) => (this.tasks = data)
    );
  }
  onEdit(value: any) {
    this.onShowForm.emit(value);
  }
  toggleDeleteEvent(e: any) {
    this.onDelete.emit(e);
  }
  navigate(id: string) {
    this.navToDetails.navigate(id);
  }
}
