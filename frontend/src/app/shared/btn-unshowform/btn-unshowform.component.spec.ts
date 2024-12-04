import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnUnshowformComponent } from './btn-unshowform.component';

describe('BtnUnshowformComponent', () => {
  let component: BtnUnshowformComponent;
  let fixture: ComponentFixture<BtnUnshowformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnUnshowformComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BtnUnshowformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
