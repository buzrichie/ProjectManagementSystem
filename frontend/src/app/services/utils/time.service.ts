import { Injectable } from '@angular/core';
import dayjs from 'dayjs';  // Corrected import
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend Day.js with the relativeTime plugin
dayjs.extend(relativeTime);

@Injectable({
  providedIn: 'root',
})
export class TimeService {

  constructor() {}

  // Returns relative time (e.g., '5 minutes ago')
  getRelativeTime(isoDate: string): string {
    const date = dayjs(isoDate);  // Use dayjs function directly
    return date.fromNow(); // Example: '5 minutes ago'
  }

  // Returns formatted date (e.g., 'December 12, 2024')
  getFormattedDate(isoDate: string): string {
    const date = dayjs(isoDate);  // Use dayjs function directly
    return date.format('MMMM D, YYYY'); // Example: 'December 12, 2024'
  }
}
