import { Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDocumentation, IGroup } from '../../types';
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
import { AuthService } from '../../services/auth/auth.service';
import { DocumentationService } from '../../services/api/documentation.service';

@Component({
  selector: 'app-project-submission',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './project-submission.component.html',
  styleUrl: './project-submission.component.css',
})
export class ProjectSubmissionComponent implements OnInit {
  authService = inject(AuthService);
  fileService = inject(FileService);
  teamService = inject(TeamService);
  docService = inject(DocumentationService);
  baseUrl = environment.backendUrl;

  groupId!: IGroup['_id'];
  documentationData: IDocumentation | null = null;

  chapters = [
    { name: 'Introduction', file: null as string | null },
    { name: 'Literature Review', file: null as string | null },
    { name: 'Methodology', file: null as string | null },
    { name: 'Results and Analysis', file: null as string | null },
    { name: 'Conclusion', file: null as string | null },
  ];

  chapterForms: FormGroup[] = [];
  documentationForm!: FormGroup;
  projectBriefForm!: FormGroup;
  // groupIdForm!: FormControl;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.getDocumentation();
    this.initializeForms();
  }

  getDocumentation(): void {
    const userGroup = this.authService.authUserSubject.value?.group;
    if (userGroup) {
      this.docService
        .getGroupDocu<IDocumentation>(userGroup as string)
        .subscribe({
          next: (res) => {
            this.documentationData = res;

            this.documentationData.chapters.map((chapter) => {
              this.chapters.forEach((x) => {
                console.log(chapter);

                if (typeof chapter !== 'string' && chapter.name == x.name) {
                  x.file = chapter.fileUrl;
                }
              });
              //   {
              //   chapterName: chapter.chapterName,
              //   status: chapter.status,
              //   fileUrl: chapter.fileUrl,
              // }
            });
          },
        });
    }
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
    this.documentationForm = this.fb.group({
      file: [null, Validators.required],
    });

    this.projectBriefForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
    });
  }

  // Handle file input change for a documentation
  onDocFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.documentationForm.patchValue({ file });
    }
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
  onDocumentationSubmit(): void {
    // if (this.groupIdForm.invalid) {
    //   return;
    // }
    if (this.documentationForm.valid) {
      const formData = new FormData();
      formData.append('file', this.documentationForm.get('file')!.value);
      // console.log(formData);
      // const file = this.chapterForms[chapterIndex].value.file;
      // console.log(`Uploading file for chapter ${chapterIndex + 1}:`, formData);

      // Add your upload logic here (e.g., call a service)
      this.fileService
        .docFileUpload(this.documentationData?._id, formData)
        .subscribe({
          next: (val) => {
            console.log(val);
            // this.documentationData.chapters.push(val);
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }
  // Submit file for a specific chapter
  onChapterSubmit(chapterIndex: number, name: string): void {
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
      // console.log(`Uploading file for chapter ${chapterIndex + 1}:`, formData);

      // Add your upload logic here (e.g., call a service)
      this.fileService
        .chapterFileUpload(
          this.documentationData?._id,
          // this.documentationData.groupId,
          name,
          formData
        )
        .subscribe({
          next: (val) => {
            console.log(val);
            this.documentationData?.chapters.push(val);
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
      // console.log('Submitting project brief:', projectBrief);

      // Add your submission logic here (e.g., call a service)
    }
  }
  // View file in a new tab
  viewFile(file: any): void {
    const fileUrl = this.getFileUrl(file);
    window.open(fileUrl, '_blank');
  }

  // Download file
  downloadFile(file: any): void {
    const fileUrl = this.getFileUrl(file);
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = file.fileName;
    anchor.click();
  }

  // Helper method to construct the file URL
  private getFileUrl(filePath: string): string {
    return `${this.baseUrl}/${filePath}`;
  }
}
