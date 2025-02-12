import { Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IChapter, IDocumentation, IGroup } from '../../types';
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
import { ToastService } from '../../services/utils/toast.service';
import { ProjectBriefFormComponent } from '../project-brief/project-brief/project-brief.component';

@Component({
  selector: 'app-project-submission',
  standalone: true,
  imports: [ProjectBriefFormComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './project-submission.component.html',
  styleUrl: './project-submission.component.css',
})
export class ProjectSubmissionComponent implements OnInit {
  baseUrl = environment.backendUrl;
  authService = inject(AuthService);
  fileService = inject(FileService);
  docService = inject(DocumentationService);
  toast = inject(ToastService);
  isConfiguring: boolean = false;
  documentationData: IDocumentation | null = null;
  currentChapterIndex: number = 0;
  allChaptersApproved = false;

  chapters = [
    { name: 'Introduction', file: null as string | null, status: '' },
    { name: 'Literature Review', file: null as string | null, status: '' },
    { name: 'Methodology', file: null as string | null, status: '' },
    { name: 'Results and Analysis', file: null as string | null, status: '' },
    { name: 'Conclusion', file: null as string | null, status: '' },
  ];

  chapterForms: FormGroup[] = [];
  documentationForm!: FormGroup;
  projectBriefForm!: FormGroup;

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

            // Ensure all chapter data is updated correctly
            this.documentationData.chapters.forEach((chapter) => {
              if (typeof chapter == 'string') {
                return;
              }
              this.chapters.forEach((x, index) => {
                if (chapter.name === x.name) {
                  this.chapters[index].file = chapter.fileUrl;
                  this.chapters[index].status = chapter.status;
                }
              });
            });

            // Debugging output
            console.log('Updated chapters:', this.chapters);

            // Ensure the next chapter is determined correctly
            this.setNextChapter();
          },
        });
    }
  }

  initializeForms(): void {
    this.chapters.forEach(() => {
      this.chapterForms.push(
        this.fb.group({
          file: [null, Validators.required],
        })
      );
    });

    this.documentationForm = this.fb.group({
      file: [null, Validators.required],
    });

    this.projectBriefForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
    });
  }

  setNextChapter(): void {
    this.currentChapterIndex = this.chapters.findIndex((chapter) => {
      console.log(chapter);

      return !chapter.file || chapter.status.toLowerCase() !== 'approved';
    });
    // console.log(this.chapters[this.currentChapterIndex]);

    if (this.currentChapterIndex === -1) {
      this.allChaptersApproved = true;
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

  onFileChange(event: any, chapterIndex: number): void {
    const file = event.target.files[0];
    if (file) {
      this.chapterForms[chapterIndex].patchValue({ file });
    }
  }

  onChapterSubmit(chapterIndex: number, name: string): void {
    if (this.chapterForms[chapterIndex].valid) {
      const formData = new FormData();
      formData.append(
        'file',
        this.chapterForms[chapterIndex].get('file')!.value
      );

      this.fileService
        .chapterFileUpload(this.documentationData?._id, name, formData)
        .subscribe({
          next: (val) => {
            this.documentationData?.chapters.push(val);
            this.chapters[chapterIndex].file = val.fileUrl;
            this.chapters[chapterIndex].status = val.status;
            this.setNextChapter();
            this.toast.success(`Chapter upload completed`);
          },
        });
    }
  }

  onDocFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.documentationForm.patchValue({ file });
    }
  }

  onDocumentationSubmit(): void {
    if (this.documentationForm.valid) {
      const formData = new FormData();
      formData.append('file', this.documentationForm.get('file')!.value);

      this.fileService
        .docFileUpload(this.documentationData?._id, formData)
        .subscribe({
          next: (val) => {
            console.log('Final documentation uploaded:', val);
            this.toast.success(`Final documentation upload completed`);
          },
        });
    }
  }

  viewFile(fileUrl: string): void {
    window.open(`${this.baseUrl}/${fileUrl}`, '_blank');
  }

  downloadFile(fileUrl: string, fileName: string): void {
    const anchor = document.createElement('a');
    anchor.href = `${this.baseUrl}/${fileUrl}`;
    anchor.download = fileName;
    anchor.click();
  }
}
