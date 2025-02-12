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
  @Input() loading!: boolean;
  @Input() diameter: number = 20;

  ngOnInit(): void {
    // this.spinnerService.spinner$.subscribe({
    //   next: (res) => {
    //     if (res == true) {
    //       console.log(' spinning');
    //     }
    //     this.loading = res;
    //   },
    // });
  }
}
