import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnTableEditComponent } from './btn-table-edit.component';

describe('BtnTableEditComponent', () => {
  let component: BtnTableEditComponent;
  let fixture: ComponentFixture<BtnTableEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnTableEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BtnTableEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
