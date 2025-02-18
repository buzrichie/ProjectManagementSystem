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

  filterCriteria: string = 'all';

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

  // Set the current filter type
  setFilter(filter: string) {
    this.filterCriteria = filter; // Set the filterCriteria based on the selected filter
    this.filterData(); // Reapply the filter after setting the criteria
  }

  // Filter data based on search term and selected filter criteria
  filterData() {
    // Filter based on search term and selected filter criteria
    this.filteredProjects = this.projects.filter((project) => {
      // Match search term with project name
      const matchesSearchTerm = project.name
        .toLowerCase()
        .includes(this.searchControl.value.toLowerCase());

      // Variable to hold filter condition result
      let matchesFilter = false;

      // Filter based on selected criteria
      switch (this.filterCriteria) {
        case 'all':
          // Show all projects
          matchesFilter = true;
          break;
        case 'new':
          // Show projects with "new" status
          matchesFilter = project.status === 'approved';
          break;
        case 'proposed':
          // Show projects with "proposed" status
          matchesFilter = project.status === 'proposed';
          break;
        case 'approved':
          // Show projects with "approved" status
          matchesFilter = project.status === 'approved';
          break;
        case 'notWorkedOnYet':
          // Show projects that are not "approved", "proposed", or "in-progress" (i.e., have not been worked on yet)
          matchesFilter = !['approved', 'proposed', 'in-progress'].includes(
            project.status
          );
          break;
        case 'others':
          // Show projects with other statuses like "declined", "completed", etc.
          matchesFilter = ![
            'new',
            'proposed',
            'approved',
            'in-progress',
          ].includes(project.status);
          break;
        default:
          matchesFilter = true;
      }

      // Return whether the project matches both search term and selected filter
      return matchesSearchTerm && matchesFilter;
    });
  }

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
