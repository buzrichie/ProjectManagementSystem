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

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.css',
})
export class GroupListComponent implements OnInit {
  teamService = inject(TeamService);

  @Input() groups: IGroup[] = [];
  @Output() onSelectedProject = new EventEmitter();

  ngOnInit(): void {
    this.teamService.teamList$.subscribe(
      (data: IGroup[]) => (this.groups = data)
    );
  }

  selected(e: { data: IGroup; index: number }) {
    this.onSelectedProject.emit(e);
  }
}
