import { Component, inject, Input, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerService } from '../../services/utils/spinner.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css',
})
export class SpinnerComponent implements OnInit {
  spinnerService = inject(SpinnerService);
  loading: boolean = false;
  @Input() diameter: number = 20;

  ngOnInit(): void {
    this.spinnerService.spinner$.subscribe({
      next: (res) => {
        this.loading = res;
      },
    });
  }
}
