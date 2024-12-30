import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationDialougeComponent } from './notification-dialouge.component';

describe('NotificationDialougeComponent', () => {
  let component: NotificationDialougeComponent;
  let fixture: ComponentFixture<NotificationDialougeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationDialougeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificationDialougeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
