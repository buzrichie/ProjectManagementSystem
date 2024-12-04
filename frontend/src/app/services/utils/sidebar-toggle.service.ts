import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private sidebarState = new BehaviorSubject<boolean>(false);
  sidebarState$ = this.sidebarState.asObservable();
  private clienNavState = new BehaviorSubject<boolean>(true);
  clienNavState$ = this.clienNavState.asObservable();

  toggleSidebar() {
    if (!this.sidebarState.getValue()) {
      this.sidebarState.next(true);
    } else {
      this.sidebarState.next(false);
    }
  }
  hideSidebar() {
    if (this.sidebarState.getValue()) {
      this.sidebarState.next(false);
    }
  }

  setSidebarState(isOpen: boolean) {
    this.sidebarState.next(isOpen);
  }
  toggleClienNavbar() {
    this.clienNavState.next(!this.clienNavState.value);
  }

  setClienNavbarState(isOpen: boolean) {
    this.clienNavState.next(isOpen);
  }
}
