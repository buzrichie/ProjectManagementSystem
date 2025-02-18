import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProjectBriefService } from '../../../services/api/project-brief.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-project-brief',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-brief.component.html',
  styleUrl: './project-brief.component.css',
})
export class ProjectBriefFormComponent implements OnInit {
  fb = inject(FormBuilder);
  pbriefService = inject(ProjectBriefService);
  authService = inject(AuthService);
  projectBriefForm!: FormGroup;

  ngOnInit(): void {
    this.projectBriefForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      // department: ['', Validators.required],
      // projectType: ['', Validators.required],
      objectives: ['', Validators.required],
      technologies: this.fb.array([]),
    });
  }

  // Objectives
  // get objectives(): FormArray {
  //   return this.projectBriefForm.get('objectives') as FormArray;
  // }
  // addObjective(): void {
  //   this.objectives.push(this.fb.control(''));
  // }
  // removeObjective(index: number): void {
  //   this.objectives.removeAt(index);
  // }

  // Technologies
  get technologies(): FormArray {
    return this.projectBriefForm.get('technologies') as FormArray;
  }
  addTechnology(): void {
    this.technologies.push(this.fb.control(''));
  }
  removeTechnology(index: number): void {
    this.technologies.removeAt(index);
  }

  // Submit Form
  onProjectBriefSubmit(): void {
    if (this.projectBriefForm.valid) {
      const authUser = this.authService.authUserSubject.value;
      console.log('Submitting Project Brief:', this.projectBriefForm.value);
      this.pbriefService.post(this.projectBriefForm.value).subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }
}
