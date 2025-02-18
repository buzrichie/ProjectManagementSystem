import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ProjectService } from '../../../services/api/project.service';
import { IGroup, IProject } from '../../../types';
import { TeamService } from '../../../services/api/team.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ScrollService } from '../../../services/utils/scroll.service';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.css',
})
export class GroupListComponent implements OnInit {
  teamService = inject(TeamService);
  scrollService = inject(ScrollService);

  @Input() groups: IGroup[] = [];
  @Output() onSelectedProject = new EventEmitter();
  @Output() onPaginationFetch = new EventEmitter();

  userRole: any;
  authService = inject(AuthService);
  filteredGroups: IGroup[] = [];
  searchControl: FormControl = new FormControl('');

  previousScrollTop = 0;
  @Input() isLoading!: boolean;
  @Input() page!: number;
  @Input() totalPages!: number;
  filterCriteria: string = 'all';

  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.userRole = data?.role;
    });
    this.teamService.teamList$.subscribe((data: IGroup[]) => {
      this.groups = data;
      console.log(this.groups);

      this.filterData();
    });
  }

  selected(e: { data: IGroup; index: number }) {
    this.onSelectedProject.emit(e);
  }
  setFilter(filter: string) {
    this.filterCriteria = filter;
    this.filterData(); // Reapply the filter when the filter changes
  }

  filterData() {
    // Filter based on search term and selected filter criteria
    this.filteredGroups = this.groups.filter((group) => {
      const matchesSearchTerm = group.name
        .toLowerCase()
        .includes(this.searchControl.value.toLowerCase());
      let matchesFilter = false;

      switch (this.filterCriteria) {
        case 'all':
          matchesFilter = true;
          break;
        case 'noProject':
          matchesFilter = !group.project;
          break;
        case 'withDocs':
          matchesFilter = !!group.documentation;
          break;
        case 'bySupervisor':
          matchesFilter = !!group.supervisor;
          break;
      }

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
}
