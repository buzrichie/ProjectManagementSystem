// import { inject } from '@angular/core';
// import {
//   ActivatedRouteSnapshot,
//   CanActivateFn,
//   ResolveFn,
//   Router,
//   RouterStateSnapshot,
// } from '@angular/router';
// import { isPlatformBrowser, isPlatformServer } from '@angular/common';
// import { PLATFORM_ID } from '@angular/core';
// import { AuthService } from '../services/auth.service';
// import { JwtService } from '../services/jwt.service';
// import { User, UserAuth } from '../../types';
// import { ClientService } from '../services/client.service';
// import { SpinnerService } from '../services/spinner.service';
// import { LocalStoreUserService } from '../services/local.store.user.service';
// import { catchError, map, of } from 'rxjs';

// export const csrfTokenGuard: CanActivateFn = () => {
//   const authService = inject(AuthService);
//   const spinnerService = inject(SpinnerService);
//   spinnerService.skip();
//   return authService.csrfToken().pipe(
//     map((res: UserAuth) => {
//       if (!res) {
//         spinnerService.reset();
//         return false;
//       }
//       spinnerService.reset();
//       return true;
//     }),
//     catchError(() => {
//       spinnerService.reset();
//       return of(false);
//     })
//   );
// };
// export const alreadyAuth: CanActivateFn = () => {
//   const authService = inject(AuthService);
//   const spinnerService = inject(SpinnerService);
//   const router = inject(Router);
//   spinnerService.skip();

//   return authService.getLocalUser().pipe(
//     map((res: User) => {
//       if (res) {
//         spinnerService.reset();
//         router.navigate(['/admin']);
//         return false;
//       }
//       spinnerService.reset();
//       return true;
//     }),
//     catchError(() => {
//       spinnerService.reset();
//       return of(false);
//     })
//   );
// };
// // export const alreadyAuth: CanActivateFn = () => {
// //   const lsUser = inject(LocalStoreUserService);
// //   const platformId = inject(LocalStoreUserService);
// //   const authService = inject(AuthService);
// //   const router = inject(Router);
// //   if (isPlatformBrowser(platformId) && lsUser.get()) {
// //     router.navigate(['/admin']);
// //   }
// //   return authService.getLocalUser.su
// //   isPlatformBrowser(platformId) && !lsUser.get() ? true : false;
// // };

// export const heroResolver: ResolveFn<User> = (
//   route: ActivatedRouteSnapshot,
//   state: RouterStateSnapshot
// ) => {
//   const clientService = inject(ClientService);
//   const router = inject(Router);
//   const spinnerService = inject(SpinnerService);
//   const platformID = inject(PLATFORM_ID);

//   return clientService.get(route.paramMap.get('id')!);
// };
