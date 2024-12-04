import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from '../../services/utils/toast.service';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [],
  templateUrl: './toaster.component.html',
  styleUrl: './toaster.component.css',
})
export class ToasterComponent implements OnInit {
  toast = inject(ToastService);

  currentToast: any = {};

  ngOnInit(): void {
    this.toast.isActiveToast$.subscribe({
      next: (data) => {
        this.currentToast = data;
      },
    });
  }
  closeToast() {
    this.toast.toastTimeOut();
  }
}
