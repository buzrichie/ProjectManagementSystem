import { Component, inject, Input } from '@angular/core';
import { ProjectService } from '../../services/api/project.service';
import { IProject } from '../../types';

@Component({
  selector: 'app-btn-approve',
  standalone: true,
  imports: [],
  templateUrl: './btn-approve.component.html',
  styleUrl: './btn-approve.component.css',
})
export class BtnApproveComponent {
  projectService = inject(ProjectService);
  @Input() project!: IProject;
  onClick(e: any) {
    this.projectService
      .put(this.project._id, {
        ...this.project,
        status: 'approved',
      } as IProject)
      .subscribe({
        next: (data) => {
          this.projectService.projectListSubject.subscribe((projects) => {
            let index = projects.findIndex(
              (project: IProject) => project._id == data._id
            );
            projects[index] = data;
          });
          // this.toast.success('Sussessfully edited project');
          // const initialProject = this.projectService.projectListSubject.value;
          // const index = initialProject.findIndex((x) => {
          //   console.log(x._id);
          //   console.log(data._id);

          //   x._id === data._id;
          // });
          // if (index === -1) {
          //   console.log(`${index}`);
          // }

          // this.projectService.projectListSubject.getValue()[index] = data;
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
