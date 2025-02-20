import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IChapter, IDocumentation } from '../../types';
import { DocumentationService } from '../../services/api/documentation.service';
import { ToastService } from '../../services/utils/toast.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BtnApproveComponent } from '../btn-approve/btn-approve.component';
import { BtnAddComponent } from '../../dashboard/btn-add/btn-add.component';
import { ChapterService } from '../../services/api/chapter.service';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [ReactiveFormsModule, BtnAddComponent, SpinnerComponent],
  templateUrl: './docs.component.html',
  styleUrl: './docs.component.css',
})
export class DocsComponent implements OnInit {
  documentationService = inject(DocumentationService);
  chapterService = inject(ChapterService);
  route = inject(ActivatedRoute);
  toast = inject(ToastService);
  baseUrl = environment.backendUrl;

  documentation: IDocumentation | null = null;

  chapters: IChapter[] = [];

  groupId!: string;
  page = 1;
  pageSize = 20;
  totalPages = 0;
  isLoading = false;
  isData: boolean = false;
  init = 0;

  ngOnInit(): void {
    // this.groupId = this.route.parent?.snapshot.url
    //   .map((urlSegment) => urlSegment.path)
    //   .join('/')!;
    this.init++;
    console.log(this.init);

    this.route.parent?.params.subscribe((params) => {
      this.fetch(undefined, params['id']);
    });
  }

  fetch(page: number = this.page, id: string) {
    if (this.isLoading) return;
    this.isLoading = true;
    if (
      this.documentationService.docsListSubject.getValue().length > 0 &&
      page <= this.page
    ) {
      this.isData = true;
    } else {
      this.documentationService.getGroupDocu<IDocumentation>(id).subscribe({
        next: (res: any) => {
          // const data = [
          //   ...this.documentationService.docsListSubject.value,
          //   ...res,
          // ];
          this.documentationService.docsListSubject.next(res);
          this.documentation = res;
          this.chapterService.chapterListSubject.next(res.chapters);
          this.chapters = res.chapters;
          // console.log(res);

          this.isLoading = false;
          this.isData = true;
          // this.page = res.currentPage;
          // this.totalPages = res.totalPages;
        },
        error: (error) => {
          this.isLoading = false;
          this.isData = true;
          this.documentation = null;
          this.chapters = [];
          // this.toast.danger(
          //   `Error in getting documentations. ${error.message}`
          // );
        },
      });
    }
  }

  approveChapter(chapter: IChapter) {
    this.chapterService
      .put(chapter._id, {
        ...chapter,
        status: 'approved',
      } as IChapter)
      .subscribe({
        next: (data) => {
          this.chapterService.chapterListSubject.subscribe((chapters) => {
            let index = chapters.findIndex(
              (chapter: IChapter) => chapter._id == data._id
            );
            chapters[index] = data;
          });
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  feedbackForm = new FormGroup({
    message: new FormControl(''),
  });

  sendFeed(chapterId: string) {
    if (this.feedbackForm.invalid) {
      return;
    }
    this.chapterService.postFeed(chapterId, this.feedbackForm.value).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  // View file in a new tab
  viewFile(file: any): void {
    const fileUrl = this.getFileUrl(file);
    window.open(fileUrl, '_blank');
  }
  // Helper method to construct the file URL
  private getFileUrl(filePath: string): string {
    return `${this.baseUrl}/${filePath}`;
  }
}
