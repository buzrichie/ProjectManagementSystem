import { Component, inject, Input } from '@angular/core';
import { UserService } from '../../services/api/user.service';
import { IProject } from '../../types';

@Component({
  selector: 'app-btn-interested',
  standalone: true,
  imports: [],
  templateUrl: './btn-interested.component.html',
  styleUrl: './btn-interested.component.css',
})
export class BtnInterestedComponent {
  private userService = inject(UserService);
  @Input() project!: IProject;

  onClick(e: any) {
    this.userService.assignProjectToUser(this.project.name).subscribe((res) => {
      console.log(res);
    });
  }
}
