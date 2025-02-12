import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { LocalStoreUserService } from '../../../services/utils/local.store.user.service';
import { IUserAuth } from '../../../types';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { SpinnerService } from '../../../services/utils/spinner.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  lsUser = inject(LocalStoreUserService);
  platformId = inject(LocalStoreUserService);
  spinnerService = inject(SpinnerService);

  errorMessage: string = '';
  isLoading: boolean = false;
  // spinnerService = inject(SpinnerService);
  isLogInMode: boolean = false;
  // ngOnInit(): void {
  //   this.isLogInMode = !this.isLogInMode;
  // }
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {
    // this.authService.authUser$.subscribe((isValid) => {
    //   console.log('hi');
    //   console.log(isValid);
    //   if (isValid) {
    //   }
    // });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  async onSubmit() {
    if (this.isLoading) return;
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: (data: IUserAuth) => {
          this.authService.authAccessTokenSubject.next(data.accessToken);
          // this.isAuthorizedSubject.next(true);
          // this.jwtService.setToken(data.accessToken);
          this.authService.authUserSubject.next(data.user);
          this.authService.LUserService.set(data.user);
          this.authService.router.navigate(['admin']);
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.error;
          this.isLoading = false;
        },
      });
      // console.log('Form Submitted', this.loginForm.value);
    }
  }
}
