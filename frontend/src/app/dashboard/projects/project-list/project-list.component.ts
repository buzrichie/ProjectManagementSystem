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
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css',
})
export class ProjectListComponent implements OnInit {
  projectService = inject(ProjectService);

  @Input() projects: IProject[] = [];
  @Output() onSelectedProject = new EventEmitter();

  filteredProjects: IProject[] = [];
  searchControl: FormControl = new FormControl('');

  ngOnInit(): void {
    this.projectService.projectList$.subscribe(
      (data: IProject[]) => (this.projects = data)
    );
    this.filterData();
  }

  selected(e: { data: IProject; index: number }) {
    this.onSelectedProject.emit(e);
  }

  filterData() {
    this.filteredProjects =
      this.projects.filter((project) =>
        project.name
          .toLowerCase()
          .includes(this.searchControl.value.toLowerCase())
      ) || this.projects;
  }
}
