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

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.css',
})
export class GroupListComponent implements OnInit {
  teamService = inject(TeamService);

  @Input() groups: IGroup[] = [];
  @Output() onSelectedProject = new EventEmitter();
  userRole: any;
  authService = inject(AuthService);
  filteredGroups: IGroup[] = [];
  searchControl: FormControl = new FormControl('');

  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.userRole = data?.role;
    });
    this.teamService.teamList$.subscribe(
      (data: IGroup[]) => (this.groups = data)
    );
    this.filterData();
  }

  selected(e: { data: IGroup; index: number }) {
    this.onSelectedProject.emit(e);
  }
  filterData() {
    this.filteredGroups =
      this.groups.filter((group) =>
        group.name
          .toLowerCase()
          .includes(this.searchControl.value.toLowerCase())
      ) || this.groups;
  }
}
