import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ShowUnshowFormService } from '../../../services/utils/show-unshow-form.service';

@Component({
  selector: 'app-btn-assign-project-or-team',
  standalone: true,
  imports: [],
  templateUrl: './btn-assign-project-or-team.component.html',
  styleUrl: './btn-assign-project-or-team.component.css',
})
export class BtnAssignProjectOrTeamComponent {
  showFormService = inject(ShowUnshowFormService);
  @Input() btnMessage!: string;
  @Output() onFormEnabled = new EventEmitter();
  enableForm() {
    // this.showFormService.enable();
    // this.onAdd.emit(this.btnMessage);
    this.onFormEnabled.emit(true);
  }
}
