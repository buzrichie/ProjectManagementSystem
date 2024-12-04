import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ShowUnshowFormService } from '../../services/utils/show-unshow-form.service';

@Component({
  selector: 'app-btn-table-edit',
  standalone: true,
  imports: [],
  templateUrl: './btn-table-edit.component.html',
  styleUrl: './btn-table-edit.component.css',
})
export class BtnTableEditComponent {
  showFormService = inject(ShowUnshowFormService);
  @Output() onTableBtnEdit = new EventEmitter();
  toggleShowForm() {
    this.showFormService.enable();
    this.onTableBtnEdit.emit();
  }
}
