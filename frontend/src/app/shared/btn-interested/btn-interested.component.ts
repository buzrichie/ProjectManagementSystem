import { Component, inject, Input } from '@angular/core';
import { IProject } from '../../types';
import { ProjectService } from '../../services/api/project.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-btn-interested',
  standalone: true,
  imports: [],
  templateUrl: './btn-interested.component.html',
  styleUrl: './btn-interested.component.css',
})
export class BtnInterestedComponent {
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  @Input() project!: IProject;

  onClick(e: any) {
    this.projectService
      .assignProjectbySelect(this.project.name)
      .subscribe((data: any) => {
        const authUserData = this.authService.authUserSubject.value;
        if (authUserData?.role == 'student') {
          if (typeof authUserData?.project == 'object') {
            authUserData.project._id = data.project._id;
          } else {
            authUserData!.project = data.project._id;
          }
          this.authService.authUserSubject.next(authUserData);
        }
      });
  }
}
