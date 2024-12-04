import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignProjectFormComponent } from './assign-project-form.component';

describe('AssignProjectFormComponent', () => {
  let component: AssignProjectFormComponent;
  let fixture: ComponentFixture<AssignProjectFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignProjectFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignProjectFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
