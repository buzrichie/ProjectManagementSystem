import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TableNavToDetailsService {
  constructor(private router: Router) {}

  navigate(id: string) {
    this.router.navigate([this.router.url, id]);
  }
}
