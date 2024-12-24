import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { catchError, map, of } from 'rxjs';
import { SpinnerService } from '../services/utils/spinner.service';
import { LocalStoreUserService } from '../services/utils/local.store.user.service';
import { IUserAuth } from '../types';

export const loggedIn: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const spinnerService = inject(SpinnerService);
  const LUserService = inject(LocalStoreUserService);

  const platformId = inject(PLATFORM_ID);
  if (authService.authAccessTokenSubject.value) {
    return true;
  }
  return authService.verify().pipe(
    map((res: IUserAuth) => {
      if (!res) {
        if (isPlatformBrowser(platformId)) {
          router.navigate(['/login']);
        }
        return false;
      }
      authService.authAccessTokenSubject.next(res.accessToken);
      let user = LUserService.get();
      if (user !== null) {
        authService.authUserSubject.next(user);
      }
      return true;
    }),
    catchError(() => {
      if (isPlatformBrowser(platformId) && LUserService.get()) {
        authService.authUserSubject.next(LUserService.get());
        return of(true);
      }
      if (isPlatformBrowser(platformId)) {
        router.navigate(['/login']);
      }
      spinnerService.reset();
      return of(false);
    })
  );
};
