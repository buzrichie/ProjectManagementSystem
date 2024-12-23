import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignSupervisorToStudentFormComponent } from './assign-supervisor-to-student-form.component';

describe('AssignSupervisorToStudentFormComponent', () => {
  let component: AssignSupervisorToStudentFormComponent;
  let fixture: ComponentFixture<AssignSupervisorToStudentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignSupervisorToStudentFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignSupervisorToStudentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
