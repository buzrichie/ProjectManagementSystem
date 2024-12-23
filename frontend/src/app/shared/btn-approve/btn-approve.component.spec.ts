import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnApproveComponent } from './btn-approve.component';

describe('BtnApproveComponent', () => {
  let component: BtnApproveComponent;
  let fixture: ComponentFixture<BtnApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnApproveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BtnApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
