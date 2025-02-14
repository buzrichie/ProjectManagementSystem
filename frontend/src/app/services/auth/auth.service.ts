import { ApplicationRef, Injectable, PLATFORM_ID, inject } from '@angular/core';
import {
  BehaviorSubject,
  EMPTY,
  interval,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { ApiService } from '../api/api.service';
import { Router } from '@angular/router';
import { IUser, IUserAuth } from '../../types';
import { TokenService } from './token.service';
import { ToastService } from '../utils/toast.service';
import { LocalStoreUserService } from '../utils/local.store.user.service';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ProjectService } from '../api/project.service';
import { ChatService } from '../chat/chat.service';
import { UserService } from '../api/user.service';
import { TeamService } from '../api/team.service';
import { TaskService } from '../api/task.service';
import { MemberService } from '../api/member.service';

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
  // s_io = inject(SocketIoService);

  //ClearUp Purpose
  // s_Service = inject(MyserviceService);
  projectService = inject(ProjectService);

  userService = inject(UserService);
  teamService = inject(TeamService);
  taskService = inject(TaskService);
  memberService = inject(MemberService);
  chatService = inject(ChatService);
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
    return this.apiService.post<IUserAuth>(`${this.url}login`, value, {
      responseType: 'json',
      withCredentials: true,
    });
  }

  signup(value: FormData) {
    return this.apiService.post<IUserAuth>(`${this.url}register/`, value, {
      responseType: 'json',
      withCredentials: true,
    });
  }

  verify(): Observable<any> {
    if (isPlatformServer(this.platform_id)) {
      return of(null);
    }

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
          this.chatService.chatListSubject.next([]);
          this.chatService.messagesSubject.next([]);
          this.chatService.currentChatSubject.next(null);
          this.userService.userListSubject.next([]);
          this.teamService.teamListSubject.next([]);
          this.taskService.taskListSubject.next([]);
          this.memberService.projectMemberListSubject.next([]);
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
    if (!this.authUserSubject.value) {
      return;
    }

    const authm = this.authUserSubject.pipe(
      switchMap((val) => {
        if (!val) {
          return [];
        }
        return interval(3600000);
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
