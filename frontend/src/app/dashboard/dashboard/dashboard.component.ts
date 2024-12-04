import { Component, OnInit, afterNextRender, inject } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Router, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { IUser } from '../../types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  constructor(private apiService: ApiService, private router: Router) {}
  user!: IUser;
  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.user = data!;
    });
  }
}
