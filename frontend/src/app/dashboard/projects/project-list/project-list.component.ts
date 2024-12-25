import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { IProject } from '../../../types';
import { ProjectService } from '../../../services/api/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css',
})
export class ProjectListComponent implements OnInit {
  projectService = inject(ProjectService);

  @Input() projects: IProject[] = [];
  @Output() onSelectedProject = new EventEmitter();

  ngOnInit(): void {
    this.projectService.projectList$.subscribe(
      (data: IProject[]) => (this.projects = data)
    );
  }

  selected(e: { data: IProject; index: number }) {
    this.onSelectedProject.emit(e);
  }
}
