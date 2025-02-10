import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { IProject, IUser } from '../../../types';
import { ProjectService } from '../../../services/api/project.service';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ScrollService } from '../../../services/utils/scroll.service';
import { AuthService } from '../../../services/auth/auth.service';
import { BtnAddComponent } from '../../btn-add/btn-add.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [BtnAddComponent, RouterLink, ReactiveFormsModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css',
})
export class ProjectListComponent implements OnInit {
  projectService = inject(ProjectService);
  scrollService = inject(ScrollService);
  authService = inject(AuthService);

  @Input() projects: IProject[] = [];
  @Output() onSelectedProject = new EventEmitter();
  @Output() onPaginationFetch = new EventEmitter();
  @Output() onAdd = new EventEmitter();

  filteredProjects: IProject[] = [];
  searchControl: FormControl = new FormControl('');
  userRole: IUser['role'];

  previousScrollTop = 0;
  @Input() isLoading!: boolean;
  @Input() page!: number;
  @Input() totalPages!: number;

  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.userRole = data?.role;
    });
    this.projectService.projectList$.subscribe((data: IProject[]) => {
      this.projects = data;
      this.filterData();
    });
  }

  selected(e: { data: IProject; index: number }) {
    this.onSelectedProject.emit(e);
  }

  filterData() {
    this.filteredProjects =
      this.projects.filter((project) =>
        project.name
          .toLowerCase()
          .includes(this.searchControl.value.toLowerCase())
      ) || this.projects;
  }

  // onScroll(event: any) {
  //   if (this.isLoading) return;

  //   const scrollContainer = event.target;
  //   const scrollPosition =
  //     scrollContainer.scrollTop + scrollContainer.clientHeight;
  //   const scrollHeight = scrollContainer.scrollHeight;

  //   // Check if scrolling down
  //   if (scrollContainer.scrollTop > this.previousScrollTop) {
  //     if (scrollPosition >= scrollHeight - 5 && this.page < this.totalPages) {
  //       this.onPaginationFetch.emit(true);
  //     }
  //     // Update previous scroll position
  //     this.previousScrollTop = scrollContainer.scrollTop;
  //   }

  // }
  onScroll(event: any) {
    this.scrollService.onScroll(
      event,
      this.page,
      this.totalPages,
      this.isLoading,
      this.onPaginationFetch,
      this.previousScrollTop
    );
  }

  enableForm() {
    // this.showFormService.enable();
    this.onAdd.emit(true);
  }
}
