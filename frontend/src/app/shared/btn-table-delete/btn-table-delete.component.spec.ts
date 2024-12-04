import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnTableDeleteComponent } from './btn-table-delete.component';

describe('BtnTableDeleteComponent', () => {
  let component: BtnTableDeleteComponent;
  let fixture: ComponentFixture<BtnTableDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnTableDeleteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BtnTableDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
