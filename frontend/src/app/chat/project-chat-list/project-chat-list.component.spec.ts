import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectChatListComponent } from './project-chat-list.component';

describe('ProjectChatListComponent', () => {
  let component: ProjectChatListComponent;
  let fixture: ComponentFixture<ProjectChatListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectChatListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectChatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
