import { ApplicationRef, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject, interval, Observable, of, switchMap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Router } from '@angular/router';
import { IUser, IUserAuth } from '../../types';
import { TokenService } from './token.service';
import { ToastService } from '../utils/toast.service';
import { LocalStoreUserService } from '../utils/local.store.user.service';
import { isPlatformBrowser } from '@angular/common';
import { ProjectService } from '../api/project.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = `/api/auth/`;
  router = inject(Router);
  apiService = inject(ApiService);
  tokenService = inject(TokenService);
  // jwtService = inject(JwtService);
  toastService = inject(ToastService);
  LUserService = inject(LocalStoreUserService);
  platform_id = inject(PLATFORM_ID);

  //ClearUp Purpose
  // s_Service = inject(MyserviceService);
  projectService = inject(ProjectService);
  // toolService = inject(ToolService);
  // userService = inject(UserService);
  // achievementService = inject(AchievementService);

  authUserSubject = new BehaviorSubject<IUser | null>(null);
  authUser$ = this.authUserSubject.asObservable();
  // isAuthorizedSubject = new BehaviorSubject<boolean>(false);
  // isAuthorized$ = this.isAuthorizedSubject.asObservable();
  authAccessTokenSubject = new BehaviorSubject<string | null>(null);
  crsfToken: string | undefined = undefined;

  constructor(private appRef: ApplicationRef) {
    this.checkAuthState();
  }

  login(value: FormData) {
    return this.apiService
      .post<IUserAuth>(`${this.url}login`, value, {
        responseType: 'json',
        withCredentials: true,
      })
      .subscribe({
        next: (data: IUserAuth) => {
          this.authAccessTokenSubject.next(data.accessToken);
          // this.isAuthorizedSubject.next(true);
          // this.jwtService.setToken(data.accessToken);
          this.authUserSubject.next(data.user);
          this.LUserService.set(data.user);
          this.router.navigate(['admin']);
        },
        error: (err) => {
          this.toastService.danger(err.error);
        },
      });
  }

  signup(value: FormData) {
    return this.apiService
      .post<IUserAuth>(`${this.url}register/`, value, {
        responseType: 'json',
        withCredentials: true,
      })
      .subscribe({
        next: (data: IUserAuth) => {
          this.authAccessTokenSubject.next(data.accessToken);
          // this.isAuthorizedSubject.next(true);
          this.authUserSubject.next(data.user);
          this.LUserService.set(data.user);
          // this.apiService.users.push(data);
          this.router.navigate(['admin']);
          console.log(data);

          return;
        },
        error: (err) => {
          this.toastService.danger(err.error);
        },
      });
  }

  verify(): Observable<any> {
    return this.apiService.get(`${this.url}verify`);
  }
  csrfToken(): Observable<any> {
    return this.apiService.get(`/`);
  }
  getLocalUser(): Observable<IUser> {
    return of(this.LUserService.get());
  }

  logOut() {
    return this.apiService
      .post(`${this.url}logout`, {}, { withCredentials: true })
      .subscribe({
        next: (res) => {
          // this.s_Service.serviceListSubject.next([]);
          this.projectService.projectListSubject.next([]);
          // this.toolService.toolListSubject.next([]);
          // this.userService.userListSubject.next([]);
          // this.achievementService.achievementListSubject.next([]);

          // this.isAuthorizedSubject.next(false);
          this.authUserSubject.next(null);
          this.tokenService.remove();
          this.LUserService.remove();
          this.crsfToken = undefined;
          this.authAccessTokenSubject.next(null);
          if (isPlatformBrowser(this.platform_id)) {
            if ('caches' in window) {
              caches.keys().then((names) => {
                names.forEach((name) => caches.delete(name));
              });
            }
          }
          this.router.navigate(['login']);
          return;
        },
        error: (err) => {
          // this.s_Service.serviceListSubject.next([]);
          this.projectService.projectListSubject.next([]);
          // this.toolService.toolListSubject.next([]);
          // this.userService.userListSubject.next([]);
          // this.achievementService.achievementListSubject.next([]);

          // this.isAuthorizedSubject.next(false);
          this.authUserSubject.next(null);
          this.tokenService.remove();
          this.LUserService.remove();
          this.crsfToken = undefined;
          this.authAccessTokenSubject.next(null);
          if (isPlatformBrowser(this.platform_id)) {
            if ('caches' in window) {
              caches.keys().then((names) => {
                names.forEach((name) => caches.delete(name));
              });
            }
          }
          this.router.navigate(['login']);
        },
      });
  }

  checkAuthState() {
    // if (isPlatformBrowser(this.platform_id)) {
    const authm = this.authUserSubject.pipe(
      switchMap((val) => {
        if (val) {
          return interval(3600000);
        } else {
          return [];
        }
      })
    );

    authm.subscribe({
      next: (res) => {
        this.verify().subscribe({
          next: async (data: any) => {
            this.authAccessTokenSubject.next(data.accessToken);
          },
          error: () => {
            this.authUserSubject.next(null);
            this.tokenService.remove();
            this.LUserService.remove();
            if (isPlatformBrowser(this.platform_id)) {
              if ('caches' in window) {
                caches.keys().then((names) => {
                  names.forEach((name) => caches.delete(name));
                });
              }
            }
            this.router.navigate(['login']);
          },
        });
      },
    });
    // }
  }
}
