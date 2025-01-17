import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { IProject, IUser } from '../../../types';
// import { MakeActiveComponent } from '../../make-active/make-active.component';
import { environment } from '../../../../environments/environment';
import { ProjectService } from '../../../services/api/project.service';
import { AuthService } from '../../../services/auth/auth.service';
import { BtnAssignProjectOrTeamComponent } from '../../components/btn-assign-project-or-team/btn-assign-project-or-team.component';
import { AssignProjectFormComponent } from '../../forms/assign-project-form/assign-project-form.component';
import { TaskFormComponent } from '../../tasks/task-form/task-form.component';
import { BtnAddComponent } from '../../btn-add/btn-add.component';
import { BtnInterestedComponent } from '../../../shared/btn-interested/btn-interested.component';
import { OverviewComponent } from '../../overview/overview.component';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    // MakeActiveComponent,
    // BtnAssignProjectOrTeamComponent,
    AssignProjectFormComponent,
    TaskFormComponent,
    // BtnAddComponent,
    // BtnInterestedComponent,

    RouterOutlet,
    RouterLink,
    // RouterLinkActive,
  ],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.css',
})
export class ProjectDetailsComponent implements OnInit {
  backendUrl = environment.backendUrl;
  route = inject(ActivatedRoute);
  projectService = inject(ProjectService);
  authService = inject(AuthService);

  userRole: IUser['role'];

  routeId: string = '';
  project!: IProject;

  isEnableAssginForm: boolean = false;
  isEnableTaskForm: boolean = false;

  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.userRole = data?.role;
    });
    this.route.params.subscribe((params) => {
      this.fetchData(params['id']);
    });
  }

  fetchData(routeId: any) {
    if (this.projectService.projectListSubject.getValue().length < 1) {
      this.projectService.getOne<IProject>(`${routeId}`).subscribe({
        next: (data: IProject) => {
          this.project = data;
        },
      });
    } else {
      this.projectService.projectList$.subscribe((projects: IProject[]) => {
        this.project = projects.find((project) => project._id === routeId)!;
      });
    }
  }
  activateAssignForm(e: any) {
    if (e === true) {
      this.isEnableAssginForm = e;
    } else {
      this.isEnableAssginForm = e;
    }
  }

  activateTaskForm(e: any) {
    console.log(e);

    if (e === true) {
      this.isEnableTaskForm = e;
    } else {
      this.isEnableTaskForm = e;
    }
  }

  postRequest(e: any) {
    console.log(e);

    this.isEnableTaskForm = e;
  }

  closeTaskForm(e: any) {
    this.isEnableTaskForm = e;
  }
}
