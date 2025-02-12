import { Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ProjectDetailsComponent } from '../project-details/project-details.component';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { ProjectTableComponent } from '../project-table/project-table.component';
import { IProject, IUser } from '../../../types';
import { ToastService } from '../../../services/utils/toast.service';
import { ShowUnshowFormService } from '../../../services/utils/show-unshow-form.service';
import { BtnAddComponent } from '../../btn-add/btn-add.component';
import { AuthService } from '../../../services/auth/auth.service';
import { ProjectService } from '../../../services/api/project.service';
import { BtnAssignProjectOrTeamComponent } from '../../components/btn-assign-project-or-team/btn-assign-project-or-team.component';
import { AssignProjectFormComponent } from '../../forms/assign-project-form/assign-project-form.component';
import { ProjectListComponent } from '../project-list/project-list.component';
import { OverviewComponent } from '../../overview/overview.component';
import { BtnUnshowformComponent } from '../../../shared/btn-unshowform/btn-unshowform.component';
import { BtnTableDeleteComponent } from '../../../shared/btn-table-delete/btn-table-delete.component';
import { BtnTableEditComponent } from '../../../shared/btn-table-edit/btn-table-edit.component';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [
    ProjectFormComponent,
    // ProjectTableComponent,
    RouterOutlet,
    // BtnAddComponent,
    // BtnAssignProjectOrTeamComponent,
    AssignProjectFormComponent,
    // OverviewComponent,
    ProjectListComponent,
    // BtnUnshowformComponent,
    // RouterLink,
    // BtnTableDeleteComponent,
    // BtnTableEditComponent,
  ],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
})
export class ProjectComponent implements OnInit {
  private url = `/api/project/`;

  toast = inject(ToastService);
  showFormService = inject(ShowUnshowFormService);
  authService = inject(AuthService);
  projectService = inject(ProjectService);

  project!: IProject;
  projects!: IProject[];
  isData: boolean = false;
  isEnableCreatePForm: boolean = false;
  isEditMode: boolean = false;
  isAddMode: boolean = false;
  selectedDataIndex!: number;
  userRole: IUser['role'];
  islistSelectedData!: { data: IProject; index: number };
  islistSelected: boolean = false;
  isLgScreen: boolean = false;

  isEnableAssginForm: boolean = false;

  page = 1;
  pageSize = 20;
  totalPages = 0;
  isLoading = false;

  ngOnInit(): void {
    this.checkScreenSize();
    this.fetch();
    this.showFormService.showForm$.subscribe((res) => {
      this.isEnableCreatePForm = res;
    });
    this.authService.authUser$.subscribe((data) => {
      this.userRole = data?.role;
    });
  }

  putRequestForm(selected: any) {
    this.project = selected.project;
    this.selectedDataIndex = selected.index;
    this.isEditMode = true;
    this.isAddMode = false;
  }

  postRequestForm(e: any) {
    this.isAddMode = true;
    this.isEditMode = false;
    this.isEnableCreatePForm = true;
  }
  activateAssignForm(e: any) {
    if (e === true) {
      this.isEnableAssginForm = e;
    } else {
      this.isEnableAssginForm = e;
    }
  }
  closeProjectForm(e: any) {
    this.isEnableCreatePForm = false;
  }
  fetch(page: number = this.page, pageSize: number = this.pageSize) {
    if (this.isLoading) return;
    this.isLoading = true;

    if (
      this.projectService.projectListSubject.getValue().length > 0 &&
      page <= this.page
    ) {
      this.isData = true;
    } else {
      this.projectService.getProjects<IProject>(page, pageSize).subscribe({
        next: (res: any) => {
          const data = [
            ...this.projectService.projectListSubject.value,
            ...res.data,
          ];

          this.projectService.projectListSubject.next(data);
          this.projects = data;
          this.isData = true;
          this.page = res.currentPage;
          this.totalPages = res.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.toast.danger(`Error in getting projects. ${error.error}`);
        },
      });
    }
  }

  paginationFetch(e: any) {
    const nextPage = this.page + 1;
    this.fetch(nextPage);
  }

  handlePostRequest(formValue: any) {
    this.projectService.post(formValue).subscribe({
      next: (data: { message: string; project: IProject }) => {
        this.projectService.projectListSubject.subscribe((oldData) => {
          oldData.push(data.project);
        });
        this.toast.success('Sussessfully added project');
      },
      error: (error) =>
        this.toast.danger(`Failed to edit project ${error.error}`),
    });
  }

  handlePutRequest(formValue: any) {
    this.projectService.put(this.project._id!, formValue).subscribe({
      next: (data: any) => {
        // find the availabe project and update the datails when the edit is successful
        // will update it to use index
        this.projectService.projectListSubject.subscribe((projects) => {
          let index = projects.findIndex(
            (project: IProject) => project._id == this.project._id
          );
          projects[index] = data;
        });
        this.toast.success('Sussessfully edited project');
      },
      error: (error) => {
        this.toast.danger(`Failed to edit project ${error.error}`);
      },
    });
  }

  deleteData(e: any) {
    this.projectService.delete(e.id).subscribe({
      next: (res: any) => {
        const data = this.projectService.projectListSubject.value;
        data.splice(e.index, 1);

        this.projectService.projectListSubject.next(data);
        this.toast.success(res.message);
      },
      error: (error) =>
        this.toast.danger(`Failed to delete service. ${error.error}`),
    });
  }

  selectedGroup(e: { data: IProject; index: number }) {
    this.islistSelectedData = e;
    this.projectService.cprojectSubject.next(e.data);
    this.islistSelected = true;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
    // console.log(this.islistSelected);
    // console.log(this.isLgScreen);
  }

  checkScreenSize() {
    this.isLgScreen = window.innerWidth >= 587;
  }
  closeForm() {
    this.islistSelected = false;
  }
}
