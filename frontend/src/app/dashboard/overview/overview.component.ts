import { Component, inject, Input, OnInit } from '@angular/core';
import { BtnInterestedComponent } from '../../shared/btn-interested/btn-interested.component';
import { BtnAssignProjectOrTeamComponent } from '../components/btn-assign-project-or-team/btn-assign-project-or-team.component';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/api/project.service';
import { IProject } from '../../types';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [BtnInterestedComponent, BtnAssignProjectOrTeamComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',
})
export class OverviewComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  projectService = inject(ProjectService);
  authService = inject(AuthService);
  routeId!: string;
  project!: IProject;

  ngOnInit(): void {
    this.routeId = this.activatedRoute.parent?.snapshot.params['id'];
    console.log(this.projectService.projectListSubject.value);

    if (this.projectService.projectListSubject.value.length < 0) {
      this.projectService.getOne(this.routeId).subscribe((res: any) => {
        this.projectService.projectListSubject.getValue().push(res.data);
        this.project = res.data;
      });
    } else {
      const pIndex = this.projectService.projectListSubject.value.findIndex(
        (x) => x._id == this.routeId
      );

      if (pIndex == -1) {
        this.projectService.getOne(this.routeId).subscribe((res: any) => {
          this.projectService.projectListSubject.getValue().push(res.data);
          this.project = res.data;
        });
      } else {
        this.project = this.projectService.projectListSubject.value[pIndex];
      }
    }
  }
}
