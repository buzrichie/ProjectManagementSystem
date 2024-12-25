import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { IProject, IUser } from '../../../types';
import { ToastService } from '../../../services/utils/toast.service';
import { BtnUnshowformComponent } from '../../../shared/btn-unshowform/btn-unshowform.component';
import { UserService } from '../../../services/api/user.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BtnUnshowformComponent],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css',
})
export class ProjectFormComponent implements OnInit {
  toast = inject(ToastService);
  userService = inject(UserService);
  @Input() isEditMode: boolean = false;
  @Input() isAddMode: boolean = false;
  @Input() project!: IProject | null;
  @Output() onPostRequest = new EventEmitter();
  @Output() onPutRequest = new EventEmitter();
  @Output() onCloseForm = new EventEmitter();

  projectForm!: FormGroup;
  projectImageFile!: File;

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    // this.projectForm = this.formBuilder.group({
    //   name: ['', [Validators.required, Validators.maxLength(100)]],
    //   description: ['', [Validators.required]],
    //   team: [''],
    //   startDate: ['', [Validators.required]],
    //   endDate: ['', [Validators.required]],
    //   supervisor: ['', [Validators.required]],
    //   status: ['Ongoing', [Validators.required]],
    // });
  }
  ngOnInit(): void {
    this.initializeForm();
    console.log(this.project);

    if (this.isEditMode === true && this.project) {
      this.projectForm.patchValue({
        ...this.project,
        startDate: this.formatDate(this.project.startDate),
        endDate: this.formatDate(this.project.endDate),
      });
    }
    if (this.isAddMode === true) {
      this.projectForm.reset();
    }
    if (this.userService.adminListSubject.getValue()!.length < 1) {
      this.userService.getUsersByRole('supervisor').subscribe({
        next: (res) => {
          console.log(res);
          this.userService.adminListSubject.next(res);
        },
        error: () => {},
      });
    }
  }

  initializeForm(): void {
    this.projectForm = this.fb.group({
      name: [this.project?.name || '', Validators.required],
      description: [this.project?.description || '', Validators.required],
      startDate: [this.project?.startDate || '', Validators.required],
      endDate: [this.project?.endDate || '', Validators.required],
      projectType: [this.project?.projectType || '', Validators.required],
      supervisor: [this.project?.supervisor || ''],
      status: [this.project?.status || ''],
      objectives: [this.project?.objectives || ''],
      department: [this.project?.department || ''],
      technologies: [this.project?.technologies?.join(', ') || ''],
    });
  }

  onImageSelected(event: any) {
    this.projectImageFile = event.target.files[0];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toISOString().split('T')[0];
  }

  projectSubmit() {
    if (this.projectForm.valid) {
      const projectData = {
        ...this.projectForm.value,
        technologies: this.projectForm.value.technologies
          ? this.projectForm.value.technologies
              .toString()
              .split(',')
              .map((tech: string) => tech.trim())
          : [],
      };
      if (this.isEditMode === true) {
        this.onPutRequest.emit(projectData);
      }
      if (this.isAddMode === true) {
        this.onPostRequest.emit(projectData);
        return this.projectForm.reset();
      }
    }
  }

  closeForm(e: any) {
    this.onCloseForm.emit(e);
  }

  // convenience getters for easy access to form controls
  get name() {
    return this.projectForm.get('name');
  }
  get description() {
    return this.projectForm.get('description');
  }
  // get team() {
  //   return this.projectForm.get('team');
  // }
  get startDate() {
    return this.projectForm.get('startDate');
  }
  get endDate() {
    return this.projectForm.get('endDate');
  }
  get supervisor() {
    return this.projectForm.get('supervisor');
  }
  get status() {
    return this.projectForm.get('status');
  }
}
