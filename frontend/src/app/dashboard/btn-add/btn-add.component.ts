import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ShowUnshowFormService } from '../../services/utils/show-unshow-form.service';

@Component({
  selector: 'app-btn-add',
  standalone: true,
  imports: [],
  templateUrl: './btn-add.component.html',
  styleUrl: './btn-add.component.css',
})
export class BtnAddComponent {
  showFormService = inject(ShowUnshowFormService);
  @Input() name!: string;
  @Output() onAdd = new EventEmitter();
  enableForm() {
    // this.showFormService.enable();
    this.onAdd.emit(true);
  }
}
