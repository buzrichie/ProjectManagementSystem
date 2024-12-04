import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ShowUnshowFormService } from '../../services/utils/show-unshow-form.service';

@Component({
  selector: 'app-btn-unshowform',
  standalone: true,
  imports: [],
  templateUrl: './btn-unshowform.component.html',
  styleUrl: './btn-unshowform.component.css',
})
export class BtnUnshowformComponent {
  showFormService = inject(ShowUnshowFormService);
  isShow: boolean = false;

  @Output() onClose = new EventEmitter();

  closeForm(event: any) {
    this.showFormService.disable();
    this.onClose.emit(false);
  }
}
