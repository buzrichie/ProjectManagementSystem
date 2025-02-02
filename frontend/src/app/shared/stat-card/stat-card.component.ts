import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css',
})
export class StatCardComponent {
  @Input() title!: string;
  @Input() value!: string | number;
  @Input() percentage!: string;
  @Input() icon!: string;
  @Input() colorClass!: string;
}
