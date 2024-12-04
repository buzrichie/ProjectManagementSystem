import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnAssignProjectOrTeamComponent } from './btn-assign-project-or-team.component';

describe('BtnAssignProjectOrTeamComponent', () => {
  let component: BtnAssignProjectOrTeamComponent;
  let fixture: ComponentFixture<BtnAssignProjectOrTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnAssignProjectOrTeamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BtnAssignProjectOrTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
