import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import { BtnTableEditComponent } from '../../../shared/btn-table-edit/btn-table-edit.component';
import { BtnTableDeleteComponent } from '../../../shared/btn-table-delete/btn-table-delete.component';
import { UserService } from '../../../services/api/user.service';
import { TableNavToDetailsService } from '../../../services/utils/table-nav-to-details.service';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BtnTableEditComponent,
    BtnTableDeleteComponent,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnInit {
  userService = inject(UserService);
  private navToDetails = inject(TableNavToDetailsService);
  users: any[] = [];
  @Output() onShowForm = new EventEmitter();
  @Output() onDelete = new EventEmitter();

  constructor(private api: ApiService) {}
  ngOnInit(): void {
    this.userService.userList$.subscribe((data) => {
      this.users = data;
    });
  }
  toggleShowForm(value: any) {
    this.onShowForm.emit(value);
  }
  toggleDeleteEvent(e: any) {
    this.onDelete.emit(e);
  }
  navigate(id: string) {
    this.navToDetails.navigate(id);
  }
}
