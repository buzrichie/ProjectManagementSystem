import { TestBed } from '@angular/core/testing';

import { ProjectBriefService } from './project-brief.service';

describe('ProjectBriefService', () => {
  let service: ProjectBriefService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectBriefService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
