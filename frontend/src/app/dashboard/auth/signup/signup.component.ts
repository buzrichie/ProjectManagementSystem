import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { LocalStoreUserService } from '../../../services/utils/local.store.user.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { IUserAuth } from '../../../types';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  // spinnerService = inject(SpinnerService);
  //   isSignUpMode: boolean = false;
  lsUser = inject(LocalStoreUserService);
  // ngOnInit(): void {
  //   this.isSignUpMode = !this.isSignUpMode;
  // }
  signupForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(PLATFORM_ID) && this.lsUser.get()) {
      this.router.navigate(['/admin']);
    }
  }

  get username() {
    return this.signupForm.get('username');
  }

  get password() {
    return this.signupForm.get('password');
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.authService.signup(this.signupForm.value).subscribe({
        next: (data: IUserAuth) => {
          this.authService.authAccessTokenSubject.next(data.accessToken);
          // this.authService.isAuthorizedSubject.next(true);
          this.authService.authUserSubject.next(data.user);
          this.authService.LUserService.set(data.user);
          // this.apiService.users.push(data);
          this.router.navigate(['admin']);
          return;
        },
        error: (err) => {
          this.errorMessage = err.error;
        },
      });
      // console.log(this.signupForm.value);
    }
  }
}
