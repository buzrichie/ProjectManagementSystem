import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScrollService {
  constructor() {}

  onScroll(
    event: any,
    currentPage: number,
    totalPages: number,
    isLoading: boolean,
    onPaginationFetch: any,
    previousScrollTop: number
  ) {
    if (isLoading) return;

    const scrollContainer = event.target;
    const scrollPosition =
      scrollContainer.scrollTop + scrollContainer.clientHeight;
    const scrollHeight = scrollContainer.scrollHeight;

    // Check if scrolling down
    if (scrollContainer.scrollTop > previousScrollTop) {
      if (scrollPosition >= scrollHeight - 5 && currentPage < totalPages) {
        // Emit event for pagination fetch
        onPaginationFetch.emit(true);
      }
      // Update previous scroll position
      previousScrollTop = scrollContainer.scrollTop;
    }
  }
}
