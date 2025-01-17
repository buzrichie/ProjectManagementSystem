import { Component, inject, OnInit } from '@angular/core';
import { FileService } from '../../services/api/file.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-explorer.component.html',
  styleUrl: './file-explorer.component.css',
})
export class FileExplorerComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  fileService = inject(FileService);
  baseUrl = environment.backendUrl;

  files: any[] = []; // Array of files passed from the parent component

  routeId!: string;
  groups: any[] = [];
  groupd: any = {
    groupa: [{ name: 'file.pdf' }, { name: 'file3.pdf' }],

    groupb: [{ name: 'file2.pdf' }],
  };

  ngOnInit(): void {
    this.files = this.groupd;
    this.groups = Object.keys(this.groupd);
    this.routeId = this.activatedRoute.parent?.snapshot.params['id'];

    this.fileService.getProjectFiles(this.routeId).subscribe({
      next: (data) => {
        this.files = data;
        // this.groups = Object.keys(data);
      },
    });
  }

  // View file in a new tab
  viewFile(file: any): void {
    const fileUrl = this.getFileUrl(file.filePath);
    window.open(fileUrl, '_blank');
  }

  // Download file
  downloadFile(file: any): void {
    const fileUrl = this.getFileUrl(file.filePath);
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
