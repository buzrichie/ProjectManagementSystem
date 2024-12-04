import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-btn-table-delete',
  standalone: true,
  imports: [],
  templateUrl: './btn-table-delete.component.html',
  styleUrl: './btn-table-delete.component.css',
})
export class BtnTableDeleteComponent {
  @Input() tableData: any = {};
  @Output() onTableBtnDelete = new EventEmitter();
  toggleDeleteEvent() {
    if (this.tableData) {
      this.onTableBtnDelete.emit(this.tableData);
    }
  }
}
