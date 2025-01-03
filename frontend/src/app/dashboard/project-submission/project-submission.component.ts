import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../services/api/api.service';
import { TaskService } from '../../services/api/task.service';
import { TableNavToDetailsService } from '../../services/utils/table-nav-to-details.service';
import { IGroup, ITask } from '../../types';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileService } from '../../services/api/file.service';
import { TeamService } from '../../services/api/team.service';

@Component({
  selector: 'app-project-submission',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './project-submission.component.html',
  styleUrl: './project-submission.component.css',
})
export class ProjectSubmissionComponent implements OnInit {
  fileService = inject(FileService);
  teamService = inject(TeamService);

  groupId!: IGroup['_id'];

  chapters = [
    { name: 'Introduction', file: null },
    { name: 'Literature Review', file: null },
    { name: 'Methodology', file: null },
    { name: 'Results and Analysis', file: null },
    { name: 'Conclusion', file: null },
  ];

  chapterForms: FormGroup[] = [];
  projectBriefForm!: FormGroup;
  // groupIdForm!: FormControl;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForms();
    this.teamService.get().subscribe({
      next: (x: any) => {
        console.log(x);
        this.groupId = x.data[0]._id!;
      },
    });
  }

  initializeForms(): void {
    // Initialize chapter forms
    this.chapters.forEach(() => {
      this.chapterForms.push(
        this.fb.group({
          file: [null, Validators.required],
        })
      );
    });
    // this.groupIdForm = new FormControl('', Validators.required);
    // Initialize project brief form
    this.projectBriefForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
    });
  }

  // Handle file input change for a chapter
  onFileChange(event: any, chapterIndex: number): void {
    const file = event.target.files[0];
    if (file) {
      this.chapterForms[chapterIndex].patchValue({ file });
    }
  }
  // setUploadRefId() {
  //   console.log(this.groupIdForm.value);

  //   this.groupId = this.groupIdForm.value;
  // }
  // Submit file for a specific chapter
  onChapterSubmit(chapterIndex: number): void {
    console.log(chapterIndex);

    // if (this.groupIdForm.invalid) {
    //   return;
    // }
    if (this.chapterForms[chapterIndex].valid) {
      const formData = new FormData();
      formData.append(
        'file',
        this.chapterForms[chapterIndex].get('file')!.value
      );
      // console.log(formData);
      // const file = this.chapterForms[chapterIndex].value.file;
      console.log(`Uploading file for chapter ${chapterIndex + 1}:`, formData);

      // Add your upload logic here (e.g., call a service)
      this.fileService.upload('group', this.groupId, formData).subscribe({
        next: (val) => {
          console.log(val);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  // Submit the project brief
  onProjectBriefSubmit(): void {
    if (this.projectBriefForm.valid) {
      const projectBrief = this.projectBriefForm.value;
      console.log('Submitting project brief:', projectBrief);

      // Add your submission logic here (e.g., call a service)
    }
  }
}
