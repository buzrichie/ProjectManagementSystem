import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupDetialsComponent } from './group-detials.component';

describe('GroupDetialsComponent', () => {
  let component: GroupDetialsComponent;
  let fixture: ComponentFixture<GroupDetialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupDetialsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroupDetialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
