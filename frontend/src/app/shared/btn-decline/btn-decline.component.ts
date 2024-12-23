import { Component, inject, Input } from '@angular/core';
import { ProjectService } from '../../services/api/project.service';
import { IProject } from '../../types';

@Component({
  selector: 'app-btn-decline',
  standalone: true,
  imports: [],
  templateUrl: './btn-decline.component.html',
  styleUrl: './btn-decline.component.css',
})
export class BtnDeclineComponent {
  projectService = inject(ProjectService);
  @Input() project!: IProject;
  onClick(e: any) {
    this.projectService
      .put(this.project._id, {
        ...this.project,
        status: 'declined',
      } as IProject)
      .subscribe({
        next: (data) => {
          this.projectService.projectListSubject.subscribe((projects) => {
            let index = projects.findIndex(
              (project: IProject) => project._id == data._id
            );
            projects[index] = data;
          });
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
