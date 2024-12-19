import { Component, inject, OnInit } from '@angular/core';
import { ToastService } from '../../../services/utils/toast.service';
import { ShowUnshowFormService } from '../../../services/utils/show-unshow-form.service';
import { AuthService } from '../../../services/auth/auth.service';
import { TaskService } from '../../../services/api/task.service';
import { ITask } from '../../../types';
import { BtnAssignProjectOrTeamComponent } from '../../components/btn-assign-project-or-team/btn-assign-project-or-team.component';
import { BtnAddComponent } from '../../btn-add/btn-add.component';
import { TaskTableComponent } from '../task-table/task-table.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AssignProjectFormComponent } from '../../forms/assign-project-form/assign-project-form.component';
import { TaskListComponent } from '../task-list/task-list.component';
import { SubtaskFormComponent } from '../subtask-form/subtask-form.component';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [
    BtnAssignProjectOrTeamComponent,
    BtnAddComponent,
    TaskFormComponent,
    AssignProjectFormComponent,
    RouterOutlet,
    TaskListComponent,
    SubtaskFormComponent,
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
})
export class TaskComponent implements OnInit {
  private url = `/api/task/`;

  toast = inject(ToastService);
  showFormService = inject(ShowUnshowFormService);
  authService = inject(AuthService);
  taskService = inject(TaskService);
  activatedRoute = inject(ActivatedRoute);

  task!: ITask;
  isData: boolean = false;
  isEnableCreatePForm: boolean = false;
  isEditMode: boolean = false;
  isAddMode: boolean = false;
  selectedDataIndex!: number;
  routeId!: string;
  isEnableSubTForm: boolean = false;
  currentTaskData!: ITask;

  isEnableAssginForm: boolean = false;

  ngOnInit(): void {
    this.fetch();
    this.showFormService.showForm$.subscribe((res) => {
      this.isEnableCreatePForm = res;
    });
  }

  putRequestForm(selected: any) {
    this.isEditMode = true;
    this.isAddMode = false;
    this.task = selected.task;
    this.selectedDataIndex = selected.index;
  }

  postRequestForm(e: any) {
    this.isAddMode = true;
    this.isEditMode = false;
    this.isEnableCreatePForm = true;
  }

  activateAssignForm(e: any) {
    if (e === true) {
      this.isEnableAssginForm = e;
    } else {
      this.isEnableAssginForm = e;
    }
  }
  closeTaskForm(e: any) {
    this.isEnableCreatePForm = false;
  }

  atvSubTaskForm(e: any) {
    this.currentTaskData = e;
    this.isEnableSubTForm = true;
  }

  fetch() {
    this.routeId = this.activatedRoute.parent?.snapshot.params['id'];
    if (this.taskService.taskListSubject.getValue().length === 0) {
      if (!this.routeId) {
        this.taskService.get<ITask>().subscribe({
          next: (res: any) => {
            this.taskService.taskListSubject.next(res.data);
            console.log(res);
            this.isData = true;
          },
          error: (error) =>
            this.toast.danger(`Error in getting tasks. ${error.error}`),
        });
      } else {
        this.taskService.getProjectTasks<ITask>(this.routeId).subscribe({
          next: (res: any) => {
            this.taskService.taskListSubject.next(res.data);
            console.log(res);
            this.isData = true;
          },
          error: (error) =>
            this.toast.danger(`Error in getting tasks. ${error.error}`),
        });
      }
    } else {
      if (!this.routeId) {
        this.isData = true;
      } else {
        const index = this.taskService.taskListSubject.value.findIndex((x) => {
          x.project._id == this.routeId;
        });
        if (index !== -1) {
          console.log(this.taskService.taskListSubject.value[index]);
          this.isData = true;
        } else {
          this.taskService.getProjectTasks<ITask>(this.routeId).subscribe({
            next: (res: any) => {
              if (res.data.length > 0) {
                this.taskService.taskListSubject.next(res.data);
              }
              this.isData = true;
            },
            error: (error) =>
              this.toast.danger(`Error in getting tasks. ${error.error}`),
          });
        }
      }
    }
  }

  // handlePostRequest(formValue: any) {
  //   this.taskService.post(formValue).subscribe({
  //     next: (data) => {
  //       this.taskService.taskListSubject.subscribe((oldData) => {
  //         oldData.push(data);
  //       });
  //       this.toast.success('Sussessfully added task');
  //     },
  //     error: (error) =>
  //       this.toast.danger(`Failed to edit task ${error.error}`),
  //   });
  // }

  handlePutRequest(formValue: any) {
    this.taskService.put(this.task._id!, formValue).subscribe({
      next: (data: any) => {
        // find the availabe task and update the datails when the edit is successful
        // will update it to use index
        this.taskService.taskListSubject.subscribe((tasks) => {
          let index = tasks.findIndex(
            (task: ITask) => task._id == this.task._id
          );
          tasks[index] = data;
        });
        this.toast.success('Sussessfully edited task');
      },
      error: (error) => {
        this.toast.danger(`Failed to edit task ${error.error}`);
      },
    });
  }

  deleteData(e: any) {
    this.taskService.delete(e.id).subscribe({
      next: (res: any) => {
        this.taskService.taskListSubject.subscribe((data) => {
          data.splice(e.index, 1);
        });
        this.toast.success(res.message);
      },
      error: (error) =>
        this.toast.danger(`Failed to delete service. ${error.error}`),
    });
  }
}
