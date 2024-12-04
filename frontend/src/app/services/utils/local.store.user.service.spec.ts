import { TestBed } from '@angular/core/testing';

import { LocalStoreUserService } from './local.store.user.service';

describe('LocalStoreUserService', () => {
  let service: LocalStoreUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStoreUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
