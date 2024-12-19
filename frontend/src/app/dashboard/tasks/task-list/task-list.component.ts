import { Component, EventEmitter, inject, Output } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../services/api/api.service';
import { TaskService } from '../../../services/api/task.service';
import { TableNavToDetailsService } from '../../../services/utils/table-nav-to-details.service';
import { ITask } from '../../../types';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
})
export class TaskListComponent {
  backendUrl = environment.backendUrl;
  private taskService = inject(TaskService);
  private navToDetails = inject(TableNavToDetailsService);
  tasks: ITask[] = [];
  @Output() onShowForm = new EventEmitter();
  @Output() onDelete = new EventEmitter();
  @Output() onAddSubForm = new EventEmitter();

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
  addSubtask(e: any) {
    console.log(e);

    this.onAddSubForm.emit(e);
  }
}
