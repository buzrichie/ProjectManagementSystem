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
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  lsUser = inject(LocalStoreUserService);

  isLoading: boolean = false;
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
      this.isLoading = true;
      this.authService.signup(this.signupForm.value).subscribe({
        next: (data: IUserAuth) => {
          this.authService.authAccessTokenSubject.next(data.accessToken);
          // this.authService.isAuthorizedSubject.next(true);
          this.authService.authUserSubject.next(data.user);
          this.authService.LUserService.set(data.user);
          // this.apiService.users.push(data);
          this.router.navigate(['admin']);
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.error;
          this.isLoading = false;
        },
      });
    }
  }
}
