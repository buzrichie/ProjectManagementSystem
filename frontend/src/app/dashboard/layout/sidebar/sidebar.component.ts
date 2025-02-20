import {
  Component,
  HostListener,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { IUser } from '../../../types';

import { SidebarService } from '../../../services/utils/sidebar-toggle.service';

import { AuthService } from '../../../services/auth/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);
  platformId = inject(PLATFORM_ID);

  themeMode: 'dark' | 'light' = 'light';

  user!: IUser | null;
  sideBar: string = '';
  isOpen = false;
  isLgScreen = false;
  hide: string =
    'bg-white dark:bg-gray-800 absolute left-0 top-0 z-9999 w-[280px] h-screen flex flex-col overflow-y-hidden duration-300 ease-linear lg:static lg:translate-x-0 ';
  show: string =
    'hidden lg:block bg-white dark:bg-gray-800 absolute left-0 top-0 z-9999 w-[280px] h-screen flex flex-col overflow-y-hidden  duration-300 ease-linear lg:static lg:translate-x-0 -translate-x-full';

  ngOnInit(): void {
    this.authService.authUser$.subscribe((data) => {
      this.user = data;
    });
    if (isPlatformBrowser(this.platformId)) {
      const prefersDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      this.themeMode = prefersDarkMode ? 'dark' : 'light';
    }
    this.sidebarService.sidebarState$.subscribe((isOpen: boolean) => {
      this.isOpen = isOpen;
    });
  }

  hideSideBar() {
    this.sidebarService.hideSidebar();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isLgScreen = window.innerWidth >= 1024; // Tailwind's lg breakpoint is 1024px
  }
}
