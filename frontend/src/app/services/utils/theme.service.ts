import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor() {
    this.setInitialTheme();
  }

  // Set the initial theme based on the user's previous preference or system preference
  setInitialTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      const prefersDarkScheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      const defaultTheme = prefersDarkScheme ? 'dark' : 'light';
      if (defaultTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  // Toggle the theme
  toggleTheme() {
    const currentTheme = document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme); // Store the theme preference
  }
}
