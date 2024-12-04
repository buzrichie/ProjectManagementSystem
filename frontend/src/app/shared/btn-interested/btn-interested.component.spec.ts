import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnInterestedComponent } from './btn-interested.component';

describe('BtnInterestedComponent', () => {
  let component: BtnInterestedComponent;
  let fixture: ComponentFixture<BtnInterestedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnInterestedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BtnInterestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
