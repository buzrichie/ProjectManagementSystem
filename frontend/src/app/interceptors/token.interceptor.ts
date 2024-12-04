import { HttpInterceptorFn } from '@angular/common/http';
// import { AuthService } from '../services/auth.service';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';
// import { ClientService } from '../services/client.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  // const clientService = inject(ClientService);

  const token = authService.authAccessTokenSubject.value;
  // const csrfToken = clientService.csrfToken;

  const headers: any = {};

  if (token) {
    headers.authorization = `Bearer ${token}`; // Add Bearer token
  }
  // if (csrfToken) {
  //   headers.csrfToken = csrfToken;
  // }

  const clonedRequest = req.clone({
    setHeaders: headers,
  });

  return next(clonedRequest);
};
