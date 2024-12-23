import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import { BtnTableDeleteComponent } from '../../../shared/btn-table-delete/btn-table-delete.component';
import { BtnTableEditComponent } from '../../../shared/btn-table-edit/btn-table-edit.component';
import { environment } from '../../../../environments/environment';
import { ProjectService } from '../../../services/api/project.service';
import { IProject } from '../../../types';
import { TableNavToDetailsService } from '../../../services/utils/table-nav-to-details.service';
import { BtnApproveComponent } from '../../../shared/btn-approve/btn-approve.component';
@Component({
  selector: 'app-project-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BtnTableEditComponent,
    BtnTableDeleteComponent,
    BtnApproveComponent,
  ],
  templateUrl: './project-table.component.html',
  styleUrl: './project-table.component.css',
})
export class ProjectTableComponent implements OnInit {
  backendUrl = environment.backendUrl;
  private projectService = inject(ProjectService);
  private navToDetails = inject(TableNavToDetailsService);
  projects: IProject[] = [];
  @Output() onShowForm = new EventEmitter();
  @Output() onDelete = new EventEmitter();

  constructor(private api: ApiService) {}
  ngOnInit(): void {
    this.projectService.projectList$.subscribe(
      (data: IProject[]) => (this.projects = data)
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
