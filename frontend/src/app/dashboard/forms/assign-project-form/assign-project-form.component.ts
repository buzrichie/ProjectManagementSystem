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
import { IProject, ITeam } from '../../../types';

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
  teams: ITeam[] = [];

  assignProjectForm!: FormGroup;
  isEnableForm: boolean = true;

  @Input() teamNameVal: ITeam['name'] = '';
  @Input() projectNameVal: ITeam['name'] = '';

  @Output() onCloseForm = new EventEmitter();

  constructor() {
    this.assignProjectForm = this.fb.group({
      teamName: ['', [Validators.required]],
      projectName: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.teamNameVal) {
      this.assignProjectForm.patchValue({ teamName: this.teamNameVal });
    }
    if (this.projectNameVal) {
      this.assignProjectForm.patchValue({ projectName: this.projectNameVal });
    }
    this.teamService.getTeams().subscribe({
      next: (res: any) => {
        this.teams = res.data;
      },
      error: () => {},
    });

    this.projectService.getProjectsByQuery().subscribe({
      next: (res: any) => {
        this.projects = res.data;
      },
      error: () => {},
    });
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

  onTeamSearch() {
    const teamName = this.teamName?.value;
    const filteredList = this.teams.filter(
      (e) => e.name.toLowerCase() === teamName.toLowerCase()
    );
    if (filteredList.length < 1) {
      this.teamService.searchTeams(teamName);
    }
  }

  assignProject() {
    console.log(this.assignProjectForm.value);
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

  get teamName() {
    return this.assignProjectForm.get('teamName');
  }
}
