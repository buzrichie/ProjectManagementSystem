import { TestBed } from '@angular/core/testing';

import { TableNavToDetailsService } from './table-nav-to-details.service';

describe('TableNavToDetailsService', () => {
  let service: TableNavToDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableNavToDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
