import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnDeclineComponent } from './btn-decline.component';

describe('BtnDeclineComponent', () => {
  let component: BtnDeclineComponent;
  let fixture: ComponentFixture<BtnDeclineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnDeclineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BtnDeclineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
