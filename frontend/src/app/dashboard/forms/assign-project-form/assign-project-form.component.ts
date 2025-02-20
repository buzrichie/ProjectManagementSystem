import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BtnUnshowformComponent } from '../../../shared/btn-unshowform/btn-unshowform.component';
import { ProjectService } from '../../../services/api/project.service';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../../services/api/team.service';
import { IProject, IGroup } from '../../../types';

@Component({
  selector: 'app-assign-project-form',
  standalone: true,
  imports: [ReactiveFormsModule, BtnUnshowformComponent, CommonModule],
  templateUrl: './assign-project-form.component.html',
  styleUrls: ['./assign-project-form.component.css'],
})
export class AssignProjectFormComponent {
  fb = inject(FormBuilder);
  projectService = inject(ProjectService);
  teamService = inject(TeamService);

  projects: IProject[] = [];
  groups: IGroup[] = [];

  assignProjectForm!: FormGroup;
  isEnableForm: boolean = true;

  @Input() groupNameVal: IGroup['name'] = '';
  @Input() projectNameVal: IGroup['name'] = '';

  @Output() onCloseForm = new EventEmitter();

  constructor() {
    this.assignProjectForm = this.fb.group({
      groupName: ['', [Validators.required]],
      projectName: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.groupNameVal) {
      this.assignProjectForm.patchValue({ groupName: this.groupNameVal });
    }
    if (this.projectNameVal) {
      this.assignProjectForm.patchValue({ projectName: this.projectNameVal });
    }
    this.teamService.getTeams().subscribe({
      next: (res: any) => {
        this.groups = res.data;
      },
      error: () => {},
    });

    this.projectService.getProjectsByQuery().subscribe({
      next: (res: any) => {
        this.projects = res.data;
      },
      error: () => {},
    });

    this.teamService.searchTeams('');
    this.projectService.searchProjects('');
  }

  onProjectSearch() {
    const projectName = this.projectName?.value;
    const filteredList = this.projects.filter(
      (e) => e.name.toLowerCase() === projectName.toLowerCase()
    );
    if (filteredList.length < 1) {
      this.projectService.searchProjects(projectName);
    }
  }

  onGroupSearch() {
    const groupName = this.groupName?.value;
    const filteredList = this.groups.filter(
      (e) => e.name.toLowerCase() === groupName.toLowerCase()
    );
    if (filteredList.length < 1) {
      this.teamService.searchTeams(groupName);
    }
  }

  assignProject() {
    if (this.assignProjectForm.valid) {
      this.projectService
        .assignProjectToTeam(this.assignProjectForm.value)
        .subscribe((e) => {
          console.log(e);
        });
    }
  }

  closeForm(e: any) {
    this.onCloseForm.emit(e);
  }

  get projectName() {
    return this.assignProjectForm.get('projectName');
  }

  get groupName() {
    return this.assignProjectForm.get('groupName');
  }
}
