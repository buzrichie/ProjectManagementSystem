import { Component, inject, Input, OnInit } from '@angular/core';
import { BtnInterestedComponent } from '../../shared/btn-interested/btn-interested.component';
import { BtnAssignProjectOrTeamComponent } from '../components/btn-assign-project-or-team/btn-assign-project-or-team.component';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/api/project.service';
import { IProject, IUser } from '../../types';
import { AuthService } from '../../services/auth/auth.service';
import { BtnApproveComponent } from '../../shared/btn-approve/btn-approve.component';
import { BtnDeclineComponent } from '../../shared/btn-decline/btn-decline.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    BtnInterestedComponent,
    BtnAssignProjectOrTeamComponent,
    BtnApproveComponent,
    BtnDeclineComponent,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',
})
export class OverviewComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  projectService = inject(ProjectService);
  authService = inject(AuthService);
  routeId!: string;
  project!: IProject;
  userRole!: IUser['role'];

  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.userRole = data?.role;
    });
    this.projectService.cproject$.subscribe((data) => {
      if (!data) return;
      this.project = data;
    });
    // If user did not click on a chat list yet get to the overview page
    if (!this.projectService.cprojectSubject.value) {
      this.routeId = this.activatedRoute.parent?.snapshot.params['id'];
      if (this.projectService.projectListSubject.value.length < 0) {
        this.projectService.getOne(this.routeId).subscribe((res: any) => {
          this.projectService.projectListSubject.getValue().push(res.data);
          // this.project = res.data;
          this.projectService.projectListSubject.subscribe((x) => {
            this.project = x[-1];
          });
        });
      } else {
        const pIndex = this.projectService.projectListSubject.value.findIndex(
          (x) => x._id == this.routeId
        );

        if (pIndex == -1) {
          this.projectService.getOne(this.routeId).subscribe((res: any) => {
            this.projectService.projectListSubject.getValue().push(res.data);
            // this.project = res.data;
            this.projectService.projectListSubject.subscribe((x) => {
              this.project = x[pIndex];
            });
          });
        } else {
          // this.project = this.projectService.projectListSubject.value[pIndex];
          this.projectService.projectListSubject.subscribe((x) => {
            this.project = x[pIndex];
          });
        }
      }
    }
  }
}
