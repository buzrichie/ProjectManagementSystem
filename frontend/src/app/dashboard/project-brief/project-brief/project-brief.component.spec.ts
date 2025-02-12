import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectBriefComponent } from './project-brief.component';

describe('ProjectBriefComponent', () => {
  let component: ProjectBriefComponent;
  let fixture: ComponentFixture<ProjectBriefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectBriefComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectBriefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
