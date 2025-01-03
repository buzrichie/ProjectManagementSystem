import { Component, inject, Input } from '@angular/core';
import { IProject } from '../../types';
import { ProjectService } from '../../services/api/project.service';

@Component({
  selector: 'app-btn-interested',
  standalone: true,
  imports: [],
  templateUrl: './btn-interested.component.html',
  styleUrl: './btn-interested.component.css',
})
export class BtnInterestedComponent {
  private projectService = inject(ProjectService);
  @Input() project!: IProject;

  onClick(e: any) {
    this.projectService
      .assignProjectbySelect(this.project.name)
      .subscribe((res) => {
        console.log(res);
      });
  }
}
