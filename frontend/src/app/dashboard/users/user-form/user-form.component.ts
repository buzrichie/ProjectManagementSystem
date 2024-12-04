import { CommonModule, ɵparseCookieValue } from '@angular/common';
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
import { IUser } from '../../../types';
import { AuthService } from '../../../services/auth/auth.service';
import { ToasterComponent } from '../../../shared/toaster/toaster.component';
import { ToastService } from '../../../services/utils/toast.service';
import { BtnUnshowformComponent } from '../../../shared/btn-unshowform/btn-unshowform.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // ToasterComponent,
    BtnUnshowformComponent,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css',
})
export class UserFormComponent implements OnChanges {
  private url = `/api/user/`;

  authService = inject(AuthService);
  toast = inject(ToastService);
  @Input() isEditMode: boolean = false;
  @Input() isAddMode: boolean = false;
  @Input() isSignUpMode: boolean = false;
  @Input() isLogInMode: boolean = false;
  @Input() user: IUser = {
    username: '',
    password: '',
  };

  @Output() onPostRequest = new EventEmitter();
  @Output() onPutRequest = new EventEmitter();

  userForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService
  ) {
    this.userForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  //When the user data changes the new user is populated with the onChange
  ngOnChanges(): void {
    if (this.isEditMode === true && this.user) {
      this.userForm.patchValue(this.user);
    }
  }
  unShowFormEvent(e: any) {
    this.isAddMode = false;
    this.isEditMode = false;
  }

  userSubmit() {
    if (this.isEditMode === true) {
      this.onPutRequest.emit({
        target: this.user._id,
        value: this.userForm.value,
      });
    }
    if (this.userForm.valid) {
      if (this.isAddMode === true) {
        this.onPostRequest.emit(this.userForm.value);
        return this.userForm.reset();
      }
    }
    // if (this.isEditMode === true) {
    //   console.log('the form value', this.userForm.value);

    // } else if (this.isAddMode === true) {

    // }
  }
  // convenience getters for easy access to form controls
  get username() {
    return this.userForm.get('username');
  }
  get password() {
    return this.userForm.get('password');
  }
}
