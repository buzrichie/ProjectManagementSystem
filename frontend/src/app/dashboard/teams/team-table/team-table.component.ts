import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import { BtnTableDeleteComponent } from '../../../shared/btn-table-delete/btn-table-delete.component';
import { BtnTableEditComponent } from '../../../shared/btn-table-edit/btn-table-edit.component';
import { environment } from '../../../../environments/environment';
import { TeamService } from '../../../services/api/team.service';
import { IGroup } from '../../../types';
import { TableNavToDetailsService } from '../../../services/utils/table-nav-to-details.service';
@Component({
  selector: 'app-team-table',
  standalone: true,
  imports: [
    CommonModule,

    RouterLink,
    BtnTableEditComponent,
    BtnTableDeleteComponent,
  ],
  templateUrl: './team-table.component.html',
  styleUrl: './team-table.component.css',
})
export class TeamTableComponent implements OnInit {
  backendUrl = environment.backendUrl;
  private teamService = inject(TeamService);
  private activatedRoute = inject(ActivatedRoute);
  private navToDetails = inject(TableNavToDetailsService);
  teams: IGroup[] = [];
  @Input() projectTeams: IGroup[] = [];
  @Output() onShowForm = new EventEmitter();
  @Output() onDelete = new EventEmitter();

  constructor(private api: ApiService) {}
  ngOnInit(): void {
    let routeId = this.activatedRoute.parent?.snapshot.params['id'];

    // this.teamService.teamList$.subscribe((data: IGroup[]) => {

    if (!routeId) {
      this.teamService.teamList$.subscribe(
        (data: IGroup[]) => (this.teams = data)
      );
    } else {
      let availableTeams = [
        ...this.projectTeams,
        ...this.teamService.teamListSubject.value,
      ];
      if (availableTeams.length < 1) {
        this.teamService.getProjectTeams<IGroup>(`${routeId}`).subscribe({
          next: (res: any) => {
            this.teams = res.data;
          },
        });
      } else {
        this.teams = availableTeams.filter((team) => team.project === routeId)!;

        if (this.teams.length < 1) {
          this.teamService.getProjectTeams<IGroup>(routeId).subscribe({
            next: (res: any) => {
              // this.teamService.teamListSubject.next([...data, ...res.data]);
              this.teams = res.data;
            },
          });
        }
      }
    }
  }
  onEdit(value: any) {
    this.onShowForm.emit(value);
  }
  toggleDeleteEvent(e: any) {
    this.onDelete.emit(e);
  }
  navigate(id: string) {
    this.navToDetails.navigate(id);
  }
}
