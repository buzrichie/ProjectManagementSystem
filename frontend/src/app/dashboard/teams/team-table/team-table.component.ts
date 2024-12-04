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
import { ITeam } from '../../../types';
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
  private navToDetails = inject(TableNavToDetailsService);
  teams: ITeam[] = [];
  @Output() onShowForm = new EventEmitter();
  @Output() onDelete = new EventEmitter();

  constructor(private api: ApiService) {}
  ngOnInit(): void {
    this.teamService.teamList$.subscribe(
      (data: ITeam[]) => (this.teams = data)
    );
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
